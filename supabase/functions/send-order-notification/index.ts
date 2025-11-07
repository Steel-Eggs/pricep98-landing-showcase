import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CallbackRequest {
  type: "callback";
  name: string;
  phone: string;
}

interface PromoRequest {
  type: "promo";
  name: string;
  phone: string;
  productName?: string;
  productPrice?: number;
}

interface OrderRequest {
  type: "order";
  productName: string;
  configuration: {
    wheels: string;
    hub: string;
    tent?: string;
    accessories: string[];
  };
  totalPrice: number;
  name: string;
  phone: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get recipient email from settings
    const { data: settings, error: settingsError } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "contact_email")
      .single();

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      throw new Error("Failed to fetch recipient email");
    }

    const recipientEmail = settings.value;
    const requestData: CallbackRequest | PromoRequest | OrderRequest = await req.json();

    let emailSubject = "";
    let emailHtml = "";

    if (requestData.type === "callback") {
      emailSubject = "Новый запрос на обратный звонок";
      emailHtml = `
        <h1>Новый запрос на обратный звонок</h1>
        <p><strong>Имя:</strong> ${requestData.name}</p>
        <p><strong>Телефон:</strong> ${requestData.phone}</p>
        <p>Пожалуйста, свяжитесь с клиентом как можно скорее.</p>
      `;
    } else if (requestData.type === "promo") {
      emailSubject = "Новая заявка по акции";
      emailHtml = `
        <h1>Новая заявка по акции</h1>
        <p><strong>Имя:</strong> ${requestData.name}</p>
        <p><strong>Телефон:</strong> ${requestData.phone}</p>
        ${requestData.productName ? `<p><strong>Товар:</strong> ${requestData.productName}</p>` : ''}
        ${requestData.productPrice ? `<p><strong>Цена:</strong> ${new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0,
        }).format(requestData.productPrice)}</p>` : ''}
        <p>Пожалуйста, свяжитесь с клиентом как можно скорее.</p>
      `;
    } else if (requestData.type === "order") {
      const accessoriesList = requestData.configuration.accessories.length > 0
        ? `<li><strong>Комплектующие:</strong> ${requestData.configuration.accessories.join(", ")}</li>`
        : "";

      emailSubject = `Новый заказ: ${requestData.productName}`;
      emailHtml = `
        <h1>Новый заказ прицепа</h1>
        <h2>Товар: ${requestData.productName}</h2>
        
        <h3>Конфигурация:</h3>
        <ul>
          <li><strong>Колёса:</strong> ${requestData.configuration.wheels}</li>
          <li><strong>Ступица:</strong> ${requestData.configuration.hub}</li>
          ${requestData.configuration.tent ? `<li><strong>Тент:</strong> ${requestData.configuration.tent}</li>` : ""}
          ${accessoriesList}
        </ul>
        
        <h3>Итоговая цена: ${new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0,
        }).format(requestData.totalPrice)}</h3>
        
        <h3>Контактные данные:</h3>
        <p><strong>Имя:</strong> ${requestData.name}</p>
        <p><strong>Телефон:</strong> ${requestData.phone}</p>
      `;
    }

    // Send email via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ПРИЦЕП98 <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
    }

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

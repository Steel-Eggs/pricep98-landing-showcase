import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const SMTP_HOST = Deno.env.get("SMTP_HOST");
const SMTP_PORT = Deno.env.get("SMTP_PORT");
const SMTP_USER = Deno.env.get("SMTP_USER");
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD");

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
  basePrice: number;
  oldPrice?: number;
  tentPrice?: number;
  tentName?: string;
  wheelPrice?: number;
  hubPrice?: number;
  accessoriesPrices?: Array<{ name: string; price: number }>;
  totalPrice: number;
  name: string;
  phone: string;
  isFromHero?: boolean;
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

    // Split multiple emails by comma and trim whitespace
    const recipientEmails = settings.value
      .split(',')
      .map((email: string) => email.trim())
      .filter((email: string) => email.length > 0);
    
    const requestData: CallbackRequest | PromoRequest | OrderRequest = await req.json();

    // Save submission to database
    const submissionData: any = {
      type: requestData.type,
      name: requestData.name,
      phone: requestData.phone,
    };

    if (requestData.type === "order") {
      submissionData.product_name = requestData.productName;
      submissionData.configuration = requestData.configuration;
    } else if (requestData.type === "promo") {
      submissionData.product_name = requestData.productName;
    }

    const { error: insertError } = await supabase
      .from("submissions")
      .insert(submissionData);

    if (insertError) {
      console.error("Error saving submission:", insertError);
      // Continue with email even if DB insert fails
    } else {
      console.log("Submission saved to database");
    }

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
      const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
      }).format(price);

      const accessoriesList = requestData.accessoriesPrices && requestData.accessoriesPrices.length > 0
        ? requestData.accessoriesPrices.map(acc => 
            `<li>• ${acc.name} <strong>(+${formatPrice(acc.price)})</strong></li>`
          ).join("")
        : "";

      const sourceNote = requestData.isFromHero ? "📍 <em>Заявка с главной страницы (акция)</em>" : "";

      emailSubject = `Новый заказ: ${requestData.productName}`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6; border-bottom: 3px solid #3b82f6; padding-bottom: 10px;">🚚 Новый заказ прицепа</h1>
          ${sourceNote ? `<p style="margin: 15px 0;">${sourceNote}</p>` : ""}
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1f2937; margin-top: 0;">📦 ТОВАР: ${requestData.productName}</h2>
          </div>
          
          <div style="background: #fff; border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">💰 ЦЕНЫ:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 8px 0; font-size: 16px;">
                <strong>Базовая цена:</strong> ${formatPrice(requestData.basePrice)}
              </li>
              ${requestData.oldPrice ? `
                <li style="padding: 8px 0; font-size: 16px;">
                  <strong>Старая цена:</strong> 
                  <span style="text-decoration: line-through; color: #9ca3af;">${formatPrice(requestData.oldPrice)}</span>
                  <span style="color: #ef4444; font-weight: bold; margin-left: 10px;">
                    СКИДКА ${formatPrice(requestData.oldPrice - requestData.basePrice)}
                  </span>
                </li>
              ` : ""}
            </ul>
          </div>
          
          <div style="background: #fff; border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3b82f6; margin-top: 0;">⚙️ КОНФИГУРАЦИЯ:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 8px 0; font-size: 16px;">
                <strong>🔘 Колёса:</strong> ${requestData.configuration.wheels}
                ${requestData.wheelPrice && requestData.wheelPrice !== 0 ? 
                  `<strong style="color: #059669;">(${requestData.wheelPrice > 0 ? '+' : ''}${formatPrice(requestData.wheelPrice)})</strong>` : 
                  '<em style="color: #6b7280;">(базовая)</em>'}
              </li>
              <li style="padding: 8px 0; font-size: 16px;">
                <strong>🔩 Ступица:</strong> ${requestData.configuration.hub}
                ${requestData.hubPrice && requestData.hubPrice !== 0 ? 
                  `<strong style="color: #059669;">(${requestData.hubPrice > 0 ? '+' : ''}${formatPrice(requestData.hubPrice)})</strong>` : 
                  '<em style="color: #6b7280;">(базовая)</em>'}
              </li>
              ${requestData.tentName ? `
                <li style="padding: 8px 0; font-size: 16px;">
                  <strong>⛺ Тент и каркас:</strong> ${requestData.tentName}
                  ${requestData.tentPrice && requestData.tentPrice !== 0 ? 
                    `<strong style="color: #059669;">(${requestData.tentPrice > 0 ? '+' : ''}${formatPrice(requestData.tentPrice)})</strong>` : 
                    '<em style="color: #6b7280;">(базовая)</em>'}
                </li>
              ` : ""}
            </ul>
          </div>
          
          ${accessoriesList ? `
          <div style="background: #fff; border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #f59e0b; margin-top: 0;">🛠️ КОМПЛЕКТУЮЩИЕ:</h3>
            <ul style="list-style: none; padding: 0; font-size: 16px;">
              ${accessoriesList}
            </ul>
          </div>
          ` : ""}
          
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h2 style="margin: 0; font-size: 28px;">💵 ИТОГОВАЯ ЦЕНА</h2>
            <p style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold;">${formatPrice(requestData.totalPrice)}</p>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">👤 КОНТАКТНЫЕ ДАННЫЕ:</h3>
            <p style="margin: 10px 0; font-size: 16px;"><strong>Имя:</strong> ${requestData.name}</p>
            <p style="margin: 10px 0; font-size: 16px;"><strong>Телефон:</strong> ${requestData.phone}</p>
          </div>
        </div>
      `;
    }

    // Send email via SMTP
    console.log("Preparing to send email via SMTP");
    console.log(`SMTP Host: ${SMTP_HOST}`);
    console.log(`SMTP Port: ${SMTP_PORT}`);
    console.log(`SMTP User: ${SMTP_USER}`);
    console.log(`Recipients: ${recipientEmails.join(", ")}`);
    console.log(`Subject: ${emailSubject}`);
    
    const smtpPort = parseInt(SMTP_PORT || "587");
    
    const client = new SMTPClient({
      connection: {
        hostname: SMTP_HOST!,
        port: smtpPort,
        tls: smtpPort === 465,
        auth: {
          username: SMTP_USER!,
          password: SMTP_PASSWORD!,
        },
      },
    });

    console.log("SMTP client initialized, attempting to send email...");
    
    // Формируем From заголовок явно
    const fromHeader = `"ПРИЦЕП98" <${SMTP_USER}>`;
    console.log(`From header: ${fromHeader}`);
    
    await client.send({
      from: fromHeader,
      to: recipientEmails.join(", "),
      subject: emailSubject,
      html: emailHtml,
      headers: {
        "Reply-To": SMTP_USER!,
      },
    });

    await client.close();
    console.log("Email sent successfully via SMTP");

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

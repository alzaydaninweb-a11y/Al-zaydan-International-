import emailjs from '@emailjs/browser';

// These should ideally be in your .env file
// For example: VITE_EMAILJS_SERVICE_ID=your_service_id
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

export interface EmailPayload {
  name: string;
  email: string;
  phone?: string;
  title: string;     // e.g., "New Order Received", "New RFQ", "Contact Us Inquiry"
  message: string;   // The formatted body (order details, RFQ details, etc.)
}

export const sendEmail = async (payload: EmailPayload): Promise<{ success: boolean; error?: string }> => {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    const errorMsg = 'EmailJS is not configured. Please add keys to .env file.';
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }

  try {
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        name: payload.name,
        email: payload.email,
        phone: payload.phone || 'N/A',
        title: payload.title,
        message: payload.message,
      },
      PUBLIC_KEY
    );
    console.log('Email successfully sent!', response.status, response.text);
    return { success: true };
  } catch (error: any) {
    const errorMsg = error.text || error.message || String(error);
    console.error('Failed to send email:', errorMsg);
    return { success: false, error: errorMsg };
  }
};

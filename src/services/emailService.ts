import { supabase } from '../lib/supabase';
import type { EditRequest } from '../types/crypto';

// Email service interface - can be implemented with any email provider
export interface EmailProvider {
  sendEmail(to: string, subject: string, html: string): Promise<void>;
}

// Simple email service that logs emails (for development/testing)
export class LoggingEmailService implements EmailProvider {
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    console.log('📧 Email would be sent:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML:', html);
    console.log('---');
    
    // In production, this would send the actual email
    // For now, we'll just log it for development purposes
  }
}

// Supabase Edge Function email service using Resend
export class SupabaseEmailService implements EmailProvider {
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, html }
      });
      
      if (error) {
        console.error('Supabase Edge Function error:', error);
        throw error;
      }
      
    } catch (error) {
      console.error('Failed to send email via Supabase Edge Function:', error);
      // Fallback to logging service for development
      const loggingService = new LoggingEmailService();
      await loggingService.sendEmail(to, subject, html);
    }
  }
}

export class EmailService {
  private emailProvider: EmailProvider;

  constructor(emailProvider?: EmailProvider) {
    // Use Supabase Edge Function with Resend in production, logging service in development
    this.emailProvider = emailProvider || new SupabaseEmailService();
  }

  async sendEditRequestConfirmation(
    email: string,
    editRequest: EditRequest
  ): Promise<void> {
    const subject = `Edit Request Submitted - Crypto Zoo`;
    const html = this.generateConfirmationEmail(editRequest);
    
    try {
      await this.emailProvider.sendEmail(email, subject, html);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  async sendEditRequestStatusUpdate(
    email: string,
    editRequest: EditRequest,
    status: 'approved' | 'rejected',
    reviewerNotes?: string
  ): Promise<void> {
    const subject = `Edit Request ${status.charAt(0).toUpperCase() + status.slice(1)} - Crypto Zoo`;
    const html = this.generateStatusUpdateEmail(editRequest, status, reviewerNotes);
    
    try {
      await this.emailProvider.sendEmail(email, subject, html);
    } catch (error) {
      console.error('Failed to send status update email:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  private generateConfirmationEmail(editRequest: EditRequest): string {
    const actionText = editRequest.action === 'create' ? 'Create' : 
                      editRequest.action === 'update' ? 'Update' : 'Delete';
    const typeText = editRequest.type === 'vertex' ? 'Primitive' : 'Construction';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Edit Request Submitted</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .highlight { background-color: #e0e7ff; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Crypto Zoo</h1>
            <p>Edit Request Submitted</p>
          </div>
          <div class="content">
            <h2>Thank you for your submission!</h2>
            <p>We have received your edit request and it is currently under review.</p>
            
            <div class="highlight">
              <strong>Request Details:</strong><br>
              Action: ${actionText} ${typeText}<br>
              ${editRequest.target_id ? `Target ID: ${editRequest.target_id}<br>` : ''}
              Submitted: ${new Date(editRequest.submitted_at).toLocaleString()}<br>
              ${editRequest.comments ? `Notes: ${editRequest.comments}<br>` : ''}
            </div>
            
            <p>You will receive another email once your request has been reviewed by our team.</p>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
          <div class="footer">
            <p>Crypto Zoo - A comprehensive database of cryptographic primitives and constructions</p>
            <p><a href="https://www.crypto-zoo.net">www.crypto-zoo.net</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateStatusUpdateEmail(
    editRequest: EditRequest, 
    status: 'approved' | 'rejected',
    reviewerNotes?: string
  ): string {
    const actionText = editRequest.action === 'create' ? 'Create' : 
                      editRequest.action === 'update' ? 'Update' : 'Delete';
    const typeText = editRequest.type === 'vertex' ? 'Primitive' : 'Construction';
    const statusColor = status === 'approved' ? '#10b981' : '#ef4444';
    const statusText = status === 'approved' ? 'Approved' : 'Rejected';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Edit Request ${statusText}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .highlight { background-color: #e0e7ff; padding: 10px; border-radius: 5px; margin: 10px 0; }
          .status { background-color: ${statusColor}; color: white; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold; }
          .notes { background-color: #fef3c7; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Crypto Zoo</h1>
            <p>Edit Request ${statusText}</p>
          </div>
          <div class="content">
            <div class="status">
              Your edit request has been <strong>${statusText.toLowerCase()}</strong>
            </div>
            
            <div class="highlight">
              <strong>Request Details:</strong><br>
              Action: ${actionText} ${typeText}<br>
              ${editRequest.target_id ? `Target ID: ${editRequest.target_id}<br>` : ''}
              Submitted: ${new Date(editRequest.submitted_at).toLocaleString()}<br>
              Reviewed: ${new Date().toLocaleString()}<br>
              ${editRequest.comments ? `Your Comments: ${editRequest.comments}<br>` : ''}
            </div>
            
            ${reviewerNotes ? `
              <div class="notes">
                <strong>Reviewer Notes:</strong><br>
                ${reviewerNotes}
              </div>
            ` : ''}
            
            ${status === 'approved' ? `
              <p>Your changes have been applied to the database. Thank you for contributing to Crypto Zoo!</p>
            ` : `
              <p>If you have any questions about this decision, please feel free to submit a new request with additional context.</p>
            `}
          </div>
          <div class="footer">
            <p>Crypto Zoo - A comprehensive database of cryptographic primitives and constructions</p>
            <p><a href="https://www.crypto-zoo.net">www.crypto-zoo.net</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService(); 
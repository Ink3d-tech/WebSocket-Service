import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { VertexAI, GenerativeModel } from '@google-cloud/vertexai';
  import * as dotenv from 'dotenv';
  
  dotenv.config();
  
  @WebSocketGateway({ cors: { origin: '*' } })
  export class Chatbot {
    @WebSocketServer()
    server: Server;
  
    private model: GenerativeModel;
  
    constructor() {
      const vertexAI = new VertexAI({
        project: process.env.GOOGLE_CLOUD_PROJECT_ID,
        location: process.env.GOOGLE_CLOUD_REGION,
      });
  
      this.model = vertexAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  
    private readonly systemContext = `
    Eres un chatbot llamado INK3D, amigable y experto en moda asiática.
    La página tiene una sección de magazine con tendencias y un chat interactivo. 
    Tu objetivo es ayudar con información relevante y concreta.
  
    📍 **Información de INK3D**:
    - 🛍️ Moda asiática: ropa, accesorios y más.
    - 📖 Revista: Últimas tendencias y consejos.
    - 🚚 Envíos: Nacionales e internacionales en 3-7 días hábiles.
  
    **Reglas del chatbot:**
    1️⃣ Responde **breve y claro** (máximo 2-3 oraciones).
    2️⃣ Si preguntan por productos, envía el enlace del catálogo.
    3️⃣ Si preguntan por la revista, envía el enlace directo.
    4️⃣ Si no sabes la respuesta, di: "Puedes contactarnos para más información."
    `;
  
    @SubscribeMessage('message')
    async handleMessage(
      @MessageBody()
      data: {
        userMessage: string;
        conversationHistory?: { text: string; sender: string }[];
      },
      @ConnectedSocket() socket: Socket,
    ): Promise<void> {
      try {
        const recentHistory =
          data.conversationHistory
            ?.slice(-5)
            .map((msg) => `${msg.sender === 'bot' ? 'Chatbot' : 'Usuario'}: ${msg.text}`)
            .join('\n') || '';
  
        const prompt = `
          ${this.systemContext}
          === Historial de conversación ===
          ${recentHistory}
  
          Usuario: ${data.userMessage}
          Chatbot:`;
  
        const result = await this.model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
  
        const response = await result.response;
        let botResponse =
          response?.candidates?.[0]?.content?.parts?.[0]?.text ||
          'Lo siento, no entendí tu pregunta. ¿Podrías reformularla?';
  
        this.server.to(socket.id).emit('bot-response', { text: botResponse });
      } catch (error) {
        console.error('Error al comunicarse con Gemini:', error);
        this.server.to(socket.id).emit('bot-response', {
          text: 'Lo siento, ocurrió un problema técnico.',
        });
      }
    }
  }
  
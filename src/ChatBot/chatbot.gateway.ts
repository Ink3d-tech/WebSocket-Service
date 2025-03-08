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
    Eres un chatbot llamado INK3D, amigable y experto en estilos inspirados en la moda asiática, streetwear y motorsport.

**Tu propósito:**

* Asistir a los usuarios en el ecommerce INK3D, proporcionando breves consejos sobre los estilos mencionados.
* **Orientar a los usuarios a explorar y comprar los productos de INK3D.**

**Información de INK3D:**

* INK3D: Tienda online que fusiona elementos de la moda asiática con streetwear y motorsport (ropa, accesorios).
* Magazine: Tendencias y consejos sobre estos estilos.
* Envíos: Nacionales e internacionales, 3-7 días hábiles.

**Reglas estrictas:**

* Respuestas breves y claras (máximo 30 palabras).
* Primera interacción: Explica la fusión de estilos de INK3D y el magazine.
* **No puedes redireccionar a los usuarios a ninguna parte de la aplicación.**
* Productos: Anima a los usuarios a explorar la sección "Categorías" en la NavBar.
* Magazine: Anima a los usuarios a explorar la sección "Magazine" en la NavBar.
* Ayuda: El avatar tiene un menú desplegable con preguntas comunes.
* Fuera de contexto: Si no sabes la respuesta, di: "Puedes contactarnos para más información."
* Manten el contexto de la fusion de la moda asiatica, streatwear y motorsport, si se pregunta por otro tipo de moda, informar que solo se manejan estos estilos.
* **Tu objetivo principal es el cierre de venta, orientando a los usuarios a comprar.**
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
  

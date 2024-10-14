const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
require("dotenv").config

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
//const MockAdapter = require('@bot-whatsapp/database/mock')
const MongoAdapter = require('@bot-whatsapp/database/mongo')
const path = require("path")
const fs = require("fs")

const menuPath = path.join(__dirname, "mensajes", "menu.txt")
const menu = fs.readFileSync(menuPath, "utf8")

//Bienvenida
const flowWelcome = addKeyword(EVENTS.WELCOME)
    .addAnswer(
        "🎉 ¡Bienvenid@ a Restaurante EL CHAMACO! 🎉\n" +
        "😄 Nos alegra tenerte aquí y estamos listos para ofrecerte una experiencia deliciosa. 🌮🍹\n" +
        "👇👇 Escribe la letra *C* para continuar🤤:\n"
    )
   
//End Bienvenia

//Carta

const flowCarta = addKeyword('C.c')
    .addAnswer("📝 Aquí te dejamos la Carta: 📜\n", {
        media: "https://drive.google.com/uc?export=download&id=1hGoFAY8T9B3LEWyviVaYAsNHCl74myy4"
    })
    .addAnswer('🍽️ ¡Haz tu reserva ahora! 👇\nAquí tienes el enlace:👇Reserva aquí👇 https://script.google.com/macros/s/AKfycbxnadY8CxHJvegI02PIM546gdo1P2_PmP06K_0liljf3Q971kk5gAs07b-bbtiqY2uf/exec')
    .addAnswer('Escribe la Letra *M* para más opciones: "*M*" ');

//Metodo de Pago
const flowPago = addKeyword(EVENTS.ACTION)
  .addAnswer(
    'Escoge un método de Pago: 💳\n0️⃣ Regresar\n1️⃣ Yape\n2️⃣ Efectivo',
    { capture: true },
    async (ctx, { flowDynamic, gotoFlow }) => {
      try {
        console.log('Opción seleccionada:', ctx.body);

        switch(ctx.body) {
          case '0':
            return await flowDynamic('Escoge un método de Pago: 💳\n0️⃣ Regresar\n1️⃣ Yape\n2️⃣ Efectivo');
            
          case '1':
            await flowDynamic('Has elegido Yape 🟢. Por favor, envía el pago al número XXXXXX.');
            return await flowDynamic([
              {
                body: 'Escribe 0 para regresar al Menu Principal',
                capture: true,
              },
            ], async (ctx, { gotoFlow }) => {
              if (ctx.body === '0') {
                return await flowDynamic('Escoge un método de Pago: 💳\n0️⃣ Regresar\n1️⃣ Yape\n2️⃣ Efectivo');
              }
            });
            
          case '2':
            await flowDynamic('Has elegido Efectivo 💵. Paga al momento de la entrega.');
            return await flowDynamic([
              {
                body: 'Escribe 0 para regresar al Menu Principal',
                capture: true,
              },
            ], async (ctx, { gotoFlow }) => {
              if (ctx.body === '0') {
                return await flowDynamic('Escoge un método de Pago: 💳\n0️⃣ Regresar\n1️⃣ Yape\n2️⃣ Efectivo');
              }
            });
            
          default:
            return await flowDynamic('Opción inválida. Por favor elige:\n0️⃣ para Regresar\n1️⃣ para Yape\n2️⃣ para Efectivo');
        }
        
      } catch (error) {
        console.error('Error en el flujo de pago:', error);
        return await flowDynamic('Lo siento, ha ocurrido un error. Inténtalo de nuevo más tarde.');
      }
    }
  );
//End Pago
//Pedido
const flowPedido = addKeyword(EVENTS.ACTION) // Aquí defines las palabras clave que activan este flujo
    .addAnswer('✅ ¿Realizaste tu pedido? Responde con "SI" o "NO" ❌', { capture: true }, async (ctx, ctxFn) => {
        const respuesta = ctx.body.toLowerCase(); // Convertir la respuesta a minúsculas para comparar

        if (respuesta === 'si') {
            await ctxFn.flowDynamic("📞 Nos estaremos comunicando en este momento.");
        } else if (respuesta === 'no') {
            await ctxFn.flowDynamic("🍽️ ¿Qué esperas para probar nuestros deliciosos platos? 😋");
        } else {
            await ctxFn.flowDynamic("❓ Respuesta no válida. Por favor, responde con 'SI' o 'NO'.");
        }
    });
//End Pedido
//Consultas
const flowConsultas = addKeyword(EVENTS.ACTION)
  .addAnswer('👋 ¡Aquí puedes realizar tu consulta! 📝 Estoy aquí para ayudarte. 😄')
  .addAnswer(
    'Por favor, escribe tu consulta a continuación:', 
    { capture: true },
    async (ctx, { flowDynamic }) => {
      try {
        // Capturamos la consulta del usuario
        const consulta = ctx.body;
        
        // Respuesta simulada a la consulta
        return await flowDynamic(`🤔 Recibí tu consulta: "${consulta}". ¡Estamos trabajando en ello! 🔧`);
      } catch (error) {
        console.error('Error en el flujo de consultas:', error);
        return await flowDynamic('Lo siento, ocurrió un error al procesar tu consulta. Inténtalo de nuevo más tarde.');
      }
    }
  );


/* { capture: true }, async (ctx, ctxFn) => {
        const prompt = promptConsultas;
        const consulta = ctx.body;
        const answer = await chat(prompt, consulta);
        await ctxFn.flowDynamic(answer.content);
    }*/
//End Consultas    
const menuFlow = addKeyword("M").addAnswer(
    menu,
    { capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        if (!["1", "2", "3", "0"].includes(ctx.body)) {
            return fallBack(
                "Respuesta no válida, por favor selecciona una de las opciones."
            );
        }
        switch (ctx.body) {
            case "1":
                return gotoFlow(flowPago);
            case "2":
                return gotoFlow(flowPedido);
            case "3":
                return gotoFlow(flowConsultas);
            case "0":
                return await flowDynamic(
                    "Saliendo... Puedes volver a acceder a este menú escribiendo '*Menu*'"
                );
        }
    }
);

const main = async () => {
  const adapterDB = new MongoAdapter({
    dbUri: process.env.MONGO_DB_URI,
    dbName: "Chamaco"
  })
    
    const adapterFlow = createFlow([flowWelcome,flowCarta, menuFlow, flowPago, flowPedido, flowConsultas])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()

const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
require("dotenv").config()

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MongoAdapter = require('@bot-whatsapp/database/mongo')

let pedidos = [];

// Funciones auxiliares
const agregarPedido = (producto, precio) => {
    pedidos.push({ producto, precio });
    return totalPedidos();
};

const totalPedidos = () => {
    return pedidos.reduce((total, item) => total + item.precio, 0);
};

// Bienvenida
const flowWelcome = addKeyword(EVENTS.WELCOME)
  .addAnswer(
    "🎉¡Bienvenid@ a El Turronero! 🎉\n" +
    "😄Nos alegra tenerte aquí y estamos listos para ofrecerte los mejores turrones. 🍬✨\n" +
    "👇👇 Escribe la letra *C* para continuar🤤:\n"
  )

// Carta
const flowCarta = addKeyword(['C', 'c'])
  .addAnswer("📝Nuestro Productos Disponibles: 📜\n", {
    media: "https://i.postimg.cc/XNrcq7d6/turron-joel-en-caja-16-turron-joel.png"
  })
  .addAnswer('"*RESERVAR POR WHATSAPP*" ')
  .addAnswer('Escribe la Letra *R* para reserva tu Turron: "*RESERVAR POR AQUI*" ')
  .addAnswer('"*🚚 ¡Entregas disponibles solo los Martes y Jueves por WhatsApp! 📅📲*"')
  .addAnswer('"*RESERVAR POR PAGINA WEB*" ')
  .addAnswer('🍽️ O Tambien ¡Haz tu reserva ahora! 👇\nAquí tienes el enlace:👇Reserva aquí👇 https://script.google.com/macros/s/AKfycbw55M5alwCk5OfUu1lRwkmAtDZxYKOv-z7Xl3uOO8ZzeCuKWEiMaUpjp1etYMbwDAlO2A/exec')
  .addAnswer('"*🚚 ¡La entrega se realiza el día que desees o inmediata a través de la página web! 📅*"') 

// Menú de Reserva
const menuReserv = addKeyword(['R', 'r'])
    .addAnswer([
        '🔍 *MENÚ DE TURRONES*',
        '',
        '1️⃣ Turrón Joel - S/20.00',
        '',
        'Para hacer tu pedido, escribe el número de la opción que deseas.',
        'Por ejemplo, escribe *1* para el Turrón Joel'
    ],
    { capture: true },
    async (ctx, { flowDynamic, gotoFlow }) => {
        const opcion = ctx.body;
        if (opcion === '1') {
            return gotoFlow(flowjoel);
        } else {
            await flowDynamic('❌ Por favor, selecciona una opción válida (1)');
            return gotoFlow(menuReserv);
        }
    });

// Flujo Joel
const flowjoel = addKeyword(['1'])
    .addAnswer('Has seleccionado el Turrón Joel', null, async (_, { flowDynamic }) => {
        const total = agregarPedido('Turrón Joel', 20);
        await flowDynamic([
            '✅ Realizaste un pedido del Turrón Joel por S/ 20.00',
            `💰 Total actual de tu pedido: S/ ${total.toFixed(2)}`
        ]);
    })
    .addAnswer([
        '¿Deseas pedir otro turrón?',
        '👉 Escribe *1* para hacer otro pedido',
        '👉 Escribe *2* para culminar tu pedido'
    ],
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic }) => {
        const respuesta = ctx.body;
        if (respuesta === '1') {
            await flowDynamic('¡Perfecto! Volvamos al menú de turrones. 📋');
            return gotoFlow(menuReserv);
        } else if (respuesta === '2') {
            return gotoFlow(recolectarDatos);
        } else {
            await flowDynamic('❌ Por favor, responde *1* para otro pedido o *2* para culminar');
            return gotoFlow(flowjoel);
        }
    });

// Recolectar Datos
const recolectarDatos = addKeyword(['RECOLECTAR_DATOS', '2'])
    .addAnswer('🙌 *Gracias por tu compra* 🙌')
    .addAnswer('Nos estaremos comunicando contigo en las próximas horas para coordinar la entrega de tu pedido. 📦✨')
    .addAnswer('Si tienes alguna consulta, no dudes en escribirnos. ¡Que disfrutes de tu turrón! 😋.')         

const main = async () => {
  const adapterDB = new MongoAdapter({
    dbUri: process.env.MONGO_DB_URI,
    dbName: "JsManuel"
  })
  
  const adapterFlow = createFlow([flowWelcome, flowCarta, menuReserv, flowjoel, recolectarDatos])
  const adapterProvider = createProvider(BaileysProvider)

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  })

  QRPortalWeb()
}

main()

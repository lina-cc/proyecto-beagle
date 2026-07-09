const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares obligatorios para producción y conexión con React
app.use(cors());
app.use(express.json());

// Puerto dinámico asignado por el hosting (Render) o el 5000 local
const PORT = process.env.PORT || 5000;

/**
 * BASE DE DATOS LOCAL (Arreglo de Objetos)
 * Aquí tenemos al Beagle y sus primos sabuesos de rastro (Scenthounds)
 */
const perrosCazadores = [
    {
        id: 1,
        nombre: "Beagle",
        tipo: "Sabueso de rastro pequeño",
        origen: "Gran Bretaña",
        habilidad_clave: "Excelente olfato para caza menor (liebres)",
        descripcion: "Es el más alegre y compacto del grupo. Posee orejas largas que ayudan a canalizar los olores hacia su nariz mientras rastrea.",
        imagen: "https://cdn.pixabay.com/photo/2020/06/27/21/03/beagle-5347232_1280.jpg"
    },
    {
        id: 2,
        nombre: "Basset Hound",
        tipo: "Sabueso de rastreo de patas cortas",
        origen: "Francia / Gran Bretaña",
        habilidad_clave: "Olfato de baja altura ultra persistente",
        descripcion: "Sus patas cortas y cuerpo pesado le permiten mantener la nariz pegada al suelo largas jornadas sin cansarse de correr.",
        imagen: "https://cdn.pixabay.com/photo/2019/05/26/04/59/basset-hound-4229577_1280.jpg"
    },
    {
        id: 3,
        nombre: "Bloodhound (Perro de San Huberto)",
        tipo: "Sabueso de rastro grande",
        origen: "Bélgica / Inglaterra",
        habilidad_clave: "El olfato más poderoso del reino animal",
        descripcion: "Es el gigante de los sabuesos. Capaz de seguir rastros de días de antigüedad. Sus arrugas en la cara ayudan a atrapar las partículas de olor.",
        imagen: "https://cdn.pixabay.com/photo/2016/11/18/08/10/bloodhound-1833602_1280.jpg"
    },
    {
        id: 4,
        nombre: "Foxhound Inglés",
        tipo: "Sabueso de rastro rápido",
        origen: "Gran Bretaña",
        habilidad_clave: "Velocidad y resistencia física extrema",
        descripcion: "Criado originalmente para la caza del zorro en grandes jaurías, es estilizado, atlético y un pariente muy cercano pero más alto que el Beagle.",
        imagen: "https://cdn.pixabay.com/photo/2024/07/29/13/42/american-foxhound-8929698_1280.jpg"
    },
    // Agrega estos objetos dentro del arreglo perrosCazadores en tu server.js:

{
    id: 5,
    nombre: "Harrier",
    tipo: "Sabueso de rastro mediano",
    origen: "Gran Bretaña",
    habilidad_clave: "Rastreo de liebres a velocidad constante",
    descripcion: "Es literalmente el hermano mediano entre el Beagle y el Foxhound. Físicamente es idéntico a un Beagle pero más alto y estilizado, criado para seguir cazadores a caballo.",
    imagen: "https://cdn.pixabay.com/photo/2023/12/19/18/32/dog-8458197_1280.jpg"
}
,
{
    id: 6,
    nombre: "Coonhound (Negro y Bronce)",
    tipo: "Sabueso de rastro e instinto de árbol",
    origen: "Estados Unidos",
    habilidad_clave: "Rastrear y acorralar presas en árboles",
    descripcion: "Especialista en seguir rastros nocturnos de mapaches y osos. Tiene un ladrido extremadamente potente y melodioso que le avisa al cazador dónde encontró la presa.",
    imagen: "https://cdn.pixabay.com/photo/2017/02/27/00/42/bluetick-coonhound-2101836_1280.jpg"
}
,
{
    id: 7,
    nombre: "Rhodesian Ridgeback (Perro Crestado Rodas)",
    tipo: "Sabueso de rastro y protección grande",
    origen: "Sudáfrica",
    habilidad_clave: "Rastreo y contención de caza mayor (Leones)",
    descripcion: "Famoso por la cresta de pelo que crece en sentido contrario en su lomo. Es un atleta formidable, usado originalmente para rastrear leones y mantenerlos a raya hasta que llegara el cazador.",
    imagen: "https://cdn.pixabay.com/photo/2018/10/18/22/16/dog-3757537_1280.jpg"
}
,
{
    id: 8,
    nombre: "Pointer Inglés",
    tipo: "Perro de muestra (Pointer)",
    origen: "Gran Bretaña",
    habilidad_clave: "Localizar aves y apuntar con el cuerpo",
    descripcion: "Aunque no es un sabueso como el Beagle, es el rey de los perros de muestra. Cuando olfatea un ave, se queda completamente congelado como una estatua, apuntando la dirección con su nariz y cola.",
    imagen: "https://cdn.pixabay.com/photo/2020/06/29/11/22/bitch-5352390_1280.jpg"
}
,
{
    id: 9,
    nombre: "Greyhound (Galgo Inglés)",
    tipo: "Lebrel (Sabueso de vista)",
    origen: "Gran Bretaña",
    habilidad_clave: "Caza por vista a velocidades extremas",
    descripcion: "A diferencia del Beagle que caza con la nariz, el Galgo caza usando sus ojos. Es el mamífero terrestre más rápido después del guepardo, alcanzando los 70 km/h en pocos segundos.",
    imagen: "https://cdn.pixabay.com/photo/2020/02/14/17/20/greyhound-4848945_1280.jpg"
}
];

/**
 * ENDPOINTS (Rutas de la API)
 */

// 1. Ruta base de bienvenida (para probar si el servidor está vivo)
app.get('/', (req, res) => {
    res.send('🐾 ¡API de Perros Cazadores Online y Lista para Rastrear! 🐾');
});

// 2. Obtener todos los perros cazadores (El endpoint que consumirá React)
app.get('/api/cazadores', (req, res) => {
    res.json(perrosCazadores);
});

// 3. Buscar un perro específico por su ID
app.get('/api/cazadores/:id', (req, res) => {
    const idBuscar = parseInt(req.params.id);
    const perroEncontrado = perrosCazadores.find(p => p.id === idBuscar);

    if (perroEncontrado) {
        res.json(perroEncontrado);
    } else {
        res.status(404).json({ mensaje: "Perrito cazador no encontrado en el gremio." });
    }
});

/**
 * Inicialización del Servidor
 */
app.listen(PORT, () => {
    console.log(`Servidor corriendo exitosamente en el puerto ${PORT}`);
});
const estilos = [
    "../../css/global.css",
    "../../css/theme.css",
    "../../css/navigation_bar.css",
    "../../css/footer.css"
];

estilos.forEach((estilo) => {
    const link = document.createElement("link");

    link.rel = "stylesheet";
    link.href = estilo;

    document.head.appendChild(link);
});



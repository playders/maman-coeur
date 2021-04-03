var gestionPage = {
evoyerlesDonnees : function(reponse, data){
    reponse.writeHead(200,{"Content-Type" : data.contentType});
    reponse.write(data.pageHtml);
    reponse.end();
},

preparerlesDonnees : function(monObj){
    var indexduPoint = monObj.pathname.indexOf(".");
    var extension = monObj.pathname.substring(indexduPoint, monObj.pathname.length);

    var data ={
        contentType : "",
        encodage : "",
        dossier : "",
        fichier : monObj.pathname.substring(1,monObj.pathname.length),
    }
    switch(extension){
        case ".html" :
            data.contentType = "text/html";
            data.encodage = "UTF-8";
            data.dossier = "html/"
        break;
        case ".css" :
            data.contentType = "text/css";
            data.dossier = "css/"
        break;
        case ".js" :
            data.contentType = "application/javascript";
            data.dossier = "js_client/"
        break;
        case ".png" :
            data.contentType = "image/png";
            data.dossier = "assets/"
        break;
        case ".jpeg" :
            data.contentType = "image/jpeg";
            data.dossier = "assets/"
        break;
        case ".jpg" :
            data.contentType = "image/jpg";
            data.dossier = "assets/"
        break;
        case ".ogg" :
            data.contentType = "audio/ogg";
            data.dossier = "assets/sond/"
        break;
        default : console.log("Erreur");
    }
    return data;
}
}
module.exports = gestionPage;
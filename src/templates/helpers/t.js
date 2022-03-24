export default function(i18n, key, ...params) { 
    let translated = i18n[key];

    params.forEach((param, index) => {
        if(index+1 === params.length) return;
        translated = translated.replace("%", param);
    });

    return translated;
}
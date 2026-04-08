Deno.serve(async (req) => {
  const url = new URL(req.url);

  // --- VİDEO LİNKLERİNİ BURAYA GİR ---
  const videoLinks: Record<string, string> = {
    "/v1": "https://pornomobi.xyz/public/video/files/videohub/Lyubitelskiy-utrenniy-seks-po-sobachi.mp4",
    "/v2": "https://pornomobi.xyz/public/video/files/videohub/Eta-suchka-vse-potekla-ot-anala---BelleNiko.mp4",
    "/v3": "https://pornomobi.xyz/public/video/files/videohub/STEP-SISTER-STAYED-ALONE-WITH-STEP-BROTHER-AND-THIS-HAPPENED.mp4",
    "/v4": "https://pornomobi.xyz/public/video/files/videohub/Nevinnaya-21-letnyaya-devushka-prosit-boleznennogo-analnogo-ziyaniya-ispolzovannogo-i-shiroko-rastyanutogo-Eddi-Dendzherom-v-video-ot-pervogo-litsa.mp4",
    "/v5": "https://pornomobi.xyz/public/video/files/videohub/Tolstushka-nasladilas-oralnym-seksom-so-svoim-parnem.mp4",
  };

  if (videoLinks[url.pathname]) {
    const targetUrl = videoLinks[url.pathname];
    
    try {
      // 1. Tarayıcıdan gelen "ileriye sarma" (Range) isteğini yakala
      const rangeHeader = req.headers.get("range");

      // 2. Bu isteği asıl video sitesine (yasaklı siteye) aynen ilet
      const fetchOptions: RequestInit = {};
      if (rangeHeader) {
        fetchOptions.headers = { "Range": rangeHeader };
      }

      // Asıl siteden videoyu veya istenen parçayı çek
      const response = await fetch(targetUrl, fetchOptions);
      
      // 3. Karşı taraftan gelen video başlıklarını al (Dosya boyutu vb.)
      const responseHeaders = new Headers(response.headers);
      
      // Güvenlik ve oynatma izinlerini ayarla
      responseHeaders.set("Access-Control-Allow-Origin", "*");
      responseHeaders.set("Accept-Ranges", "bytes"); // Tarayıcıya "Evet, ileri sarabilirsin" diyoruz

      // 4. Videonun o anki parçasını tarayıcıya gönder
      return new Response(response.body, {
        status: response.status, // 200 (Tamamı) veya 206 (Parçalı) kodunu aynen ilet
        statusText: response.statusText,
        headers: responseHeaders,
      });

    } catch (error) {
      return new Response("Video çekilirken bir hata oluştu.", { status: 500 });
    }
  }

  // Ana sayfa (index.html) sunumu
  try {
    const html = await Deno.readTextFile("./index.html");
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=UTF-8" },
    });
  } catch {
    return new Response("index.html dosyasi bulunamadi.", { status: 404 });
  }
});

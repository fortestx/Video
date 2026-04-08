Deno.serve(async (req) => {
  const url = new URL(req.url);

  // --- VİDEO LİNKLERİNİ BURAYA GİR ---
  const videoLinks: Record<string, string> = {
    "/v1": "https://mp4-cdn77.xvideos-cdn.com/df7ec181-89f4-48b2-93ef-d56ea0167a97/0/video_360p.mp4",
    "/v2": "https://t.me/keyzporn/1498",
    "/v3": "https://pornomobi.xyz/public/video/files/videohub/Lyubitelskiy-utrenniy-seks-po-sobachi.mp4",
    "/v4": "https://ornek-site.com/video4.mp4",
    "/v5": "https://ornek-site.com/video5.mp4",
  };

  // Eğer gelen istek bir video yolu ise (/v1, /v2 vb.) Proxy devreye girer
  if (videoLinks[url.pathname]) {
    const targetUrl = videoLinks[url.pathname];
    
    try {
      const response = await fetch(targetUrl);
      
      // Videoyu tarayıcıya engelsiz olarak aktar
      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "video/mp4",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=3600"
        },
      });
    } catch (error) {
      return new Response("Video çekilirken bir hata oluştu.", { status: 500 });
    }
  }

  // Eğer istek ana sayfaya geldiyse index.html dosyasını göster
  try {
    const html = await Deno.readTextFile("./index.html");
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=UTF-8" },
    });
  } catch {
    return new Response("index.html dosyasi bulunamadi. Lutfen ayni klasorde oldugundan emin olun.", { status: 404 });
  }
});

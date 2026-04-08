const GITHUB_TOKEN = "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";
const GITHUB_USER = "fortestx";
const GITHUB_REPO = "Video";
// GitLab Raw baz linkin (Kendi kullanıcı ve repo adınla güncelle)
const GITLAB_BASE_URL = "https://gitlab.com/muratkaya/video-projesi/-/raw/main/";

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // Video Listesi ve Orijinal (Yasaklı) Kaynakları
  const videos: Record<string, string> = {
    "video1.mp4": "https://pornomobi.xyz/public/video/files/videohub/Lyubitelskiy-utrenniy-seks-po-sobachi.mp4",
    "video2.mp4": "https://pornomobi.xyz/public/video/files/videohub/Eta-suchka-vse-potekla-ot-anala---BelleNiko.mp4",
    "video3.mp4": "https://pornomobi.xyz/public/video/files/videohub/STEP-SISTER-STAYED-ALONE-WITH-STEP-BROTHER-AND-THIS-HAPPENED.mp4",
    "video4.mp4": "https://pornomobi.xyz/public/video/files/videohub/Nevinnaya-21-letnyaya-devushka-prosit-boleznennogo-analnogo-ziyaniya-ispolzovannogo-i-shiroko-rastyanutogo-Eddi-Dendzherom-v-video-ot-pervogo-litsa.mp4",
    "video5.mp4": "https://pornomobi.xyz/public/video/files/videohub/Tolstushka-nasladilas-oralnym-seksom-so-svoim-parnem.mp4",
  };

  // 1. Video İsteklerini Karşıla (/v1, /v2 gibi)
  const videoKey = url.pathname.replace("/", ""); // Örn: v1
  const fileName = `video${videoKey.replace("v", "")}.mp4`; // Örn: video1.mp4

  if (videos[fileName]) {
    const gitlabUrl = `${GITLAB_BASE_URL}${fileName}`;

    // GitLab'da dosya var mı kontrol et
    const checkFile = await fetch(gitlabUrl, { method: "HEAD" });

    if (checkFile.ok) {
      // DOSYA VARSA: Proxy üzerinden oynat (Sarma desteğiyle)
      const range = req.headers.get("range");
      const res = await fetch(gitlabUrl, { headers: range ? { "Range": range } : {} });
      const headers = new Headers(res.headers);
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Accept-Ranges", "bytes");
      return new Response(res.body, { status: res.status, headers });
    } else {
      // DOSYA YOKSA: GitHub Action'ı tetikle ve bilgi ver
      await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/dispatches`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "start_upload",
          client_payload: { video_url: videos[fileName], file_name: fileName }
        }),
      });

      return new Response(`
        <html><body style="background:#121212;color:white;text-align:center;padding:50px;font-family:sans-serif;">
          <h2>Video Hazırlanıyor...</h2>
          <p>Bu video ilk kez talep edildiği için şu an sunucularımıza taşınıyor.</p>
          <p>Lütfen 1-2 dakika bekleyip <b>sayfayı yenileyin.</b></p>
          <div style="margin-top:20px;color:#03dac6;">İşlem Durumu: GitHub Action Tetiklendi ✅</div>
        </body></html>
      `, { headers: { "Content-Type": "text/html" } });
    }
  }

  // 2. Ana Sayfa (index.html)
  try {
    const html = await Deno.readTextFile("./index.html");
    return new Response(html, { headers: { "Content-Type": "text/html; charset=UTF-8" } });
  } catch {
    return new Response("Ana sayfa yuklenemedi.");
  }
});

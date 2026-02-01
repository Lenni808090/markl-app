export default async function handler(req, res) {
  let urlStr = req.query.url;

  if (Array.isArray(urlStr)) {
    urlStr = urlStr[0]; // take first one
  }

  if (typeof urlStr !== "string" || !urlStr) {
    return res.status(400).json({ error: "Bad url" });
  }

  const imageRes = await fetch(urlStr, {
    method: "GET", 
    headers: {
      "User-Agent": "YourApp/1.0", 
    },
  });

  if(!imageRes.ok){
     return res.status(imageRes.status).send("failed");
  }

  const buffer = await imageRes.arrayBuffer()

  //what type of content
  res.setHeader('Content-Type', imageRes.headers.get('content-type') || 'image/jpeg');
  //how long the chache is
  res.setHeader('Cache-Control', 'public, max-age=86400');
  // everybody can access
  res.setHeader('Access-Controll-Allow-Origin', '*');

  //converts raw nbinary buffer into node buffer
  res.send(Buffer.from(buffer));
}

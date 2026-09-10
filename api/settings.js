import {v2 as cloudinary} from 'cloudinary';
const {Pool}=require('pg');
const pool=new Pool({connectionString:process.env.POSTGRES_URL,ssl:{rejectUnauthorized:false}});

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req,res){
  try{
    if(req.method==='GET'){
      const r=await pool.query("SELECT key,value FROM site_settings WHERE key IN ('bg','avatar')");
      const out={bg:null,avatar:null};
      for(const row of r.rows){
        if(row.key==='bg')out.bg=JSON.parse(row.value);
        if(row.key==='avatar')out.avatar=JSON.parse(row.value).img||null;
      }
      return res.json(out);
    }
    if(req.method==='POST'){
      const {bg,avatar,token}=req.body||{};
      if(!token) return res.status(401).json({ok:false});
      const out={};
      if(bg&&typeof bg==='object'){
        let img=bg.img||'';
        if(img.startsWith('data:image')){
          const up=await cloudinary.uploader.upload(img,{folder:'bg'});
          img=up.secure_url;
        }
        const saved=Object.assign({},bg,{img});
        await pool.query("INSERT INTO site_settings(key,value) VALUES('bg',$1) ON CONFLICT (key) DO UPDATE SET value=$1",[JSON.stringify(saved)]);
        out.bg=saved;
      }
      if(avatar!==undefined){
        let av=String(avatar||'');
        if(av.startsWith('data:image')){
          const up=await cloudinary.uploader.upload(av,{folder:'avatar'});
          av=up.secure_url;
        }
        await pool.query("INSERT INTO site_settings(key,value) VALUES('avatar',$1) ON CONFLICT (key) DO UPDATE SET value=$1",[JSON.stringify({img:av})]);
        out.avatar=av;
      }
      return res.json(Object.assign({ok:true},out));
    }
    res.status(405).end();
  }catch(e){
    return res.status(500).json({ok:false,msg:e.message});
  }
}

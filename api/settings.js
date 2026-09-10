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
      const r=await pool.query("SELECT value FROM site_settings WHERE key='bg'");
      if(r.rows[0])return res.json(JSON.parse(r.rows[0].value));
      return res.json(null);
    }
    if(req.method==='POST'){
      const {bg,token}=req.body||{};
      if(!token) return res.status(401).json({ok:false});
      if(!bg||typeof bg!=='object') return res.status(400).json({ok:false,msg:'参数错误'});
      let img=bg.img||'';
      if(img.startsWith('data:image')){
        const up=await cloudinary.uploader.upload(img,{folder:'bg'});
        img=up.secure_url;
      }
      const saved=Object.assign({},bg,{img});
      await pool.query("INSERT INTO site_settings(key,value) VALUES('bg',$1) ON CONFLICT (key) DO UPDATE SET value=$1",[JSON.stringify(saved)]);
      return res.json({ok:true,bg:saved});
    }
    res.status(405).end();
  }catch(e){
    return res.status(500).json({ok:false,msg:e.message});
  }
}

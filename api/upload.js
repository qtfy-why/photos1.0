import {v2 as cloudinary} from 'cloudinary';
import exifr from 'exifr';
const {Pool}=require('pg');
const pool=new Pool({connectionString:process.env.POSTGRES_URL,ssl:{rejectUnauthorized:false}});

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
});

async function getShotTime(image){
  try{
    const base64=String(image).split(',')[1]||String(image);
    const buf=Buffer.from(base64,'base64');
    const meta=await exifr.parse(buf,['DateTimeOriginal','CreateDate','ModifyDate']);
    const t=meta&&(meta.DateTimeOriginal||meta.CreateDate||meta.ModifyDate);
    if(t){
      let d=null;
      if(t instanceof Date)d=t;
      else d=new Date(String(t).replace(/(\d{4}):(\d{2}):(\d{2})/,'$1-$2-$3'));
      if(d&&!isNaN(d.getTime()))return d.toLocaleDateString('zh-CN');
    }
  }catch(e){}
  return null;
}

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end();
  const {image,title,album_id,token}=req.body;
  if(!token) return res.status(401).json({ok:false});
  try{
    const shot=await getShotTime(image);
    const upload=await cloudinary.uploader.upload(image);
    const url=upload.secure_url;
    const time=new Date().toLocaleDateString('zh-CN');
    const aid=album_id?Number(album_id):null;
    await pool.query('INSERT INTO photos(title,url,time,shot_time,album_id) VALUES($1,$2,$3,$4,$5)',[title,url,time,shot,aid]);
    return res.json({ok:true,photo:{title,url,time,shot_time:shot}});
  }catch(e){
    return res.status(500).json({ok:false,msg:e.message});
  }
}

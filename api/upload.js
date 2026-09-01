import {v2 as cloudinary} from 'cloudinary';
const {Pool}=require('pg');
const pool=new Pool({connectionString:process.env.POSTGRES_URL,ssl:{rejectUnauthorized:false}});

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end();
  const {image,title,album_id,token}=req.body;
  if(!token) return res.status(401).json({ok:false});
  try{
    const upload=await cloudinary.uploader.upload(image);
    const url=upload.secure_url;
    const time=new Date().toLocaleDateString('zh-CN');
    const aid=album_id?Number(album_id):null;
    await pool.query('INSERT INTO photos(title,url,time,album_id) VALUES($1,$2,$3,$4)',[title,url,time,aid]);
    return res.json({ok:true,photo:{title,url,time}});
  }catch(e){
    return res.status(500).json({ok:false,msg:e.message});
  }
}

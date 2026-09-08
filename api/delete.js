import {v2 as cloudinary} from 'cloudinary';
const {Pool}=require('pg');
const pool=new Pool({connectionString:process.env.POSTGRES_URL,ssl:{rejectUnauthorized:false}});

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req,res){
  if(req.method!=='DELETE') return res.status(405).end();
  const {id,ids,token}=req.body||{};
  if(!token) return res.status(401).json({ok:false});
  const list=Array.isArray(ids)?ids:(id?[id]:[]);
  if(!list.length) return res.status(400).json({ok:false,msg:'参数错误'});
  try{
    const nums=list.map(Number).filter(n=>!isNaN(n));
    const find=await pool.query('SELECT url FROM photos WHERE id = ANY($1)',[nums]);
    for(const row of find.rows){
      try{
        const publicId=row.url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }catch(e){}
    }
    await pool.query('DELETE FROM photos WHERE id = ANY($1)',[nums]);
    return res.json({ok:true});
  }catch(e){
    return res.status(500).json({ok:false,msg:e.message});
  }
}

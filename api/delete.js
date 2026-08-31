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
  const {id,token}=req.body;
  if(!token) return res.status(401).json({ok:false});
  const find=await pool.query('SELECT url FROM photos WHERE id=$1',[id]);
  if(find.rows.length>0){
    const url=find.rows[0].url;
    const publicId=url.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  }
  await pool.query('DELETE FROM photos WHERE id=$1',[id]);
  return res.json({ok:true});
}

const {Pool}=require('pg');
const pool=new Pool({connectionString:process.env.POSTGRES_URL,ssl:{rejectUnauthorized:false}});

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end();
  const {id,ids,album_id,token}=req.body||{};
  if(!token) return res.status(401).json({ok:false});
  const list=Array.isArray(ids)?ids:(id?[id]:[]);
  if(!list.length) return res.status(400).json({ok:false,msg:'参数错误'});
  try{
    const nums=list.map(Number).filter(n=>!isNaN(n));
    const aid=album_id?Number(album_id):null;
    await pool.query('UPDATE photos SET album_id=$1 WHERE id = ANY($2)',[aid,nums]);
    return res.json({ok:true});
  }catch(e){
    return res.status(500).json({ok:false,msg:e.message});
  }
}

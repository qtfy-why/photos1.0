const {Pool}=require('pg');
const pool=new Pool({connectionString:process.env.POSTGRES_URL,ssl:{rejectUnauthorized:false}});

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end();
  const {ids,token}=req.body||{};
  if(!token) return res.status(401).json({ok:false});
  if(!Array.isArray(ids)||!ids.length) return res.status(400).json({ok:false,msg:'参数错误'});
  try{
    for(let i=0;i<ids.length;i++){
      await pool.query('UPDATE photos SET sort_order=$1 WHERE id=$2',[i+1,ids[i]]);
    }
    return res.json({ok:true});
  }catch(e){
    return res.status(500).json({ok:false,msg:e.message});
  }
}

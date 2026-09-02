const {Pool}=require('pg');
const pool=new Pool({connectionString:process.env.POSTGRES_URL,ssl:{rejectUnauthorized:false}});

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end();
  const {id,shot_time,token}=req.body||{};
  if(!token) return res.status(401).json({ok:false});
  if(!id) return res.status(400).json({ok:false,msg:'参数错误'});
  try{
    const st=(shot_time===null||shot_time===undefined||shot_time==='')?null:String(shot_time);
    await pool.query('UPDATE photos SET shot_time=$1 WHERE id=$2',[st,id]);
    return res.json({ok:true});
  }catch(e){
    return res.status(500).json({ok:false,msg:e.message});
  }
}

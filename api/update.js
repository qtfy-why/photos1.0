const {Pool}=require('pg');
const pool=new Pool({connectionString:process.env.POSTGRES_URL,ssl:{rejectUnauthorized:false}});

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end();
  const {id,title,shot_time,shot_location,token}=req.body||{};
  if(!token) return res.status(401).json({ok:false});
  if(!id) return res.status(400).json({ok:false,msg:'参数错误'});
  try{
    const t=title===undefined?null:String(title);
    const st=(shot_time===null||shot_time===undefined||shot_time==='')?null:String(shot_time);
    const loc=(shot_location===null||shot_location===undefined)?null:(String(shot_location).trim()||null);
    await pool.query('UPDATE photos SET title=COALESCE($1,title), shot_time=$2, shot_location=$3 WHERE id=$4',[t,st,loc,id]);
    return res.json({ok:true});
  }catch(e){
    return res.status(500).json({ok:false,msg:e.message});
  }
}

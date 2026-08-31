const {Pool}=require('pg');
const pool=new Pool({connectionString:process.env.POSTGRES_URL,ssl:{rejectUnauthorized:false}});

export default async function handler(req,res){
  if(req.method==='GET'){
    const result=await pool.query('SELECT id,title,url,time FROM photos ORDER BY id DESC');
    return res.json(result.rows);
  }
  res.status(405).end();
}

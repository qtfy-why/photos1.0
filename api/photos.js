const {Pool}=require('pg');
const pool=new Pool({connectionString:process.env.POSTGRES_URL,ssl:{rejectUnauthorized:false}});

export default async function handler(req,res){
  if(req.method==='GET'){
    try{
      const album=req.query.album;
      let sql='SELECT id,title,url,time,shot_time,album_id FROM photos';
      const params=[];
      if(album==='none'){
        sql+=' WHERE album_id IS NULL';
      }else if(album){
        if(isNaN(Number(album))) return res.status(400).json({ok:false,msg:'参数错误'});
        sql+=' WHERE album_id=$1';params.push(Number(album));
      }
      sql+=' ORDER BY id DESC';
      const result=await pool.query(sql,params);
      return res.json(result.rows);
    }catch(e){
      return res.status(500).json({ok:false,msg:e.message});
    }
  }
  res.status(405).end();
}

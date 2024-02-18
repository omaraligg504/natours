import axios from "axios"
import { showAlert } from "./alert"

export const updateSettings=async(data,type)=>{
    try{
       // console.log(data);
       //console.log(type);
        const url=type==='password'?'http://127.0.0.1:8000/api/v1/users/updatePassword':'http://127.0.0.1:8000/api/v1/users/updateMe'
        const res=await axios({
            method:'PATCH',
            url,
            data
        })
        if(res.data.status==='success'){
            showAlert('success',`${type.toUpperCase()} updated successfully`)
        }
    }
    catch(err){
        showAlert('error',err.response.data.message)
    }

}
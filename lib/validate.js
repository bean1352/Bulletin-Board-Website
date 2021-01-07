const validator = require('validator');


module.exports = {


    validateInvoice: function(body) {
        let values = Object.values(body);

        for (let i = 0; i < values.length; i++) {
  
           if(validator.isEmpty(values[i])) {
           
                return 'All fields need to be filled.';
           }
           values[i] = validator.escape(values[i])
           values[i] =validator.trim(values[i])
            
        }
   
        if(!validator.isEmail(body.Email)) {
         
            return 'Your email is invalid.';
        } 
  

    },


    validateUser: function(body) {
     

      let values = Object.values(body);

      for (let i = 0; i < values.length; i++) {

         if(validator.isEmpty(values[i])) {
         
              return 'All fields need to be filled.';
         }
         values[i] = validator.escape(values[i])
         values[i] =validator.trim(values[i])
          
      }
 
      if(!validator.isEmail(body.Email)) {
       
          return 'Your email is invalid.';
      } 


    if(!validator.equals(body.password,body.passwordConfirm)) {
     
        return 'Make sure your passwords match.';
  }

    return false;
     
    }

  };
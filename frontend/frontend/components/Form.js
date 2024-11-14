import React, { useEffect, useState } from "react";
import * as yup from "yup";
import axios from "axios";

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: "full name must be at least 3 characters",
  fullNameTooLong: "full name must be at most 20 characters",
  sizeIncorrect: "size must be S or M or L",
};

// 👇 Here you will create your schema.
const validationSchema = yup.object().shape({
  fullName: yup
    .string()
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong)
    .trim(),
  size: yup.string().oneOf(["S", "M", "L"], validationErrors.sizeIncorrect),
});

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: "1", text: "Pepperoni" },
  { topping_id: "2", text: "Green Peppers" },
  { topping_id: "3", text: "Pineapple" },
  { topping_id: "4", text: "Mushrooms" },
  { topping_id: "5", text: "Ham" },
];

const initialValues = { fullName: "", size: "", toppings: [] };

export default function Form() {

  const [serverSuccess, setServerSuccess] = useState('')
  const [serverFailure, setServerFailure] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [errors, setErrors] = useState({fullName: "", size: ""})
  const [values, setValues] = useState(initialValues)

  useEffect(( )=>{
    validationSchema.isValid(values).then((isValid) => {
      setEnabled(isValid)
    })
  }, [values.fullName, values.size])
  
  const validate = (key, value) => {
    yup
    .reach(validationSchema, key)
    .validate(value)
    .then(() =>{ 
      setErrors({...errors, [key]: ''})
    })
    .catch((error) => {
    setErrors({...errors, [key]: error.errors[0]})
    
    })
  }

  const handleChange = (evt) => {
    const {id, value} = evt.target
    validate(id, value)
    setValues({...values, [id]: value})

  }
  const handleToppings = (evt) =>{
    const { name, checked} = evt.target
    if (checked) setValues({...values, toppings: [...values.toppings, name]})
    else setValues({...values, toppings: values.toppings.filter(t =>
  t != name)})
  }
  const onSubmit = (evt) => {
    evt.preventDefault()
    axios.post('http://localhost:9009/api/order', values)
    .then(res => {
    setValues(initialValues)
    setServerSuccess(res.data.message)
    setServerFailure('')
    })
    .catch(err => {
      setServerSuccess('')
      setServerFailure(err?.response?.data?.message)
    })
  }
//Should run  
  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>
      {serverFailure && <div className="failure">{serverFailure}</div>}
      {serverSuccess && <div className="success">{serverSuccess}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label>
          <br />
          <input placeholder="Type full name" id="fullName" type="text" value={values.fullName} onChange={handleChange} />
        </div>
        {errors.fullName && <div className="error">{errors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label>
          <br />
          <select id="size" value={values.size} onChange={handleChange}>
            <option value="">----Choose Size----</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
          </select>
        </div>
        {errors.size && <div className="error">{errors.size}</div>}
      </div>

      <div className="input-group">
        {toppings.map(({ topping_id, text }) => (
          <label key={topping_id}>
            <input
             name={topping_id}
            type="checkbox"
            onChange={handleToppings}
            checked={values.toppings.includes(topping_id)}
            />
            {text}
            <br />
          </label>
        ))}
      </div>
      
      <input type="submit" disabled={!enabled}/>
    </form>
  );
}

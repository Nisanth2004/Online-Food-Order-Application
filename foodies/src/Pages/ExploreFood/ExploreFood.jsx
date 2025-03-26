import React from 'react'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'

const ExploreFood = () => {
  return (

    <>
    <div className='container'>
       <div className="row justify-content-center">
        <div className="col-md-6">
          <form >
            <div className="input-group mb-3">
              <select className='form-select mt-2' style={{'maxWidth':'150px '}}>

                <option value="Biriyani">Biriyani</option>
                <option value="Burger">Burger</option>
                <option value="Cakes">Cakes</option>
                <option value="Ice Creams">Ice Creams</option>
                <option value="Pizza">Pizza</option>
                <option value="Rolls">Rolls</option>
                <option value="Salad">Salad</option>
              </select>
              <input type='text' className='form-control mt-2' placeholder='Search your favourite dish...'></input>
              <button className='btn btn-primary mt-2' type='submit'>
                <i className='bi bi-search'></i>
              </button>
            </div>


          </form>
        </div>
       </div>
      
    </div>
<FoodDisplay/>

    </>
  )
}

export default ExploreFood

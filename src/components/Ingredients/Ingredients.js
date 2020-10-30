import React, { useReducer, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';

import Search from './Search';

const ingredientReducer = (currentIngredients, action) => {
    switch (action.type) {
        case 'SET':
            return action.ingredients; //Update
        case 'ADD':
            return [...currentIngredients, action.ingredient];
        case 'DELETE':
            return currentIngredients.filter((ing) => ing.id !== action.id);
        default:
            throw new Error('Should not get there!');
    }
};

const httpReducer = (curHttpState, action) => {
    switch (action.type) {
        case 'SEND':
            return { loading: true, error: null };
        case 'RESPONSE':
            return { ...curHttpState, loading: false };
        case 'ERROR':
            return { loading: false, error: action.errorMessage };
        case 'CLEAR':
            return { ...curHttpState, error: null };
        default:
            throw new Error('Should not get there!');
    }
};

const Ingredients = () => {
    const [httpState, dispatchHttp] = useReducer(httpReducer, { loading: false, error: null });
    const [userIngredients, dispatch] = useReducer(ingredientReducer, []); //Initialize with empty array
    // const [userIngredients, setUserIngredients] = useState([]); //This is just the ingredients that render on the screen, all the ingredients is in the database and there rendered just when the filter is empty
    // const [isLoading, setIsLoading] = useState(false);
    // const [error, setError] = useState(false);

    const filteredIngredientsHandler = useCallback((filteredIngredients) => {
        // setUserIngredients(filteredIngredients);
        dispatch({ type: 'SET', ingredients: filteredIngredients });
    }, []);
    const addIngredientHandler = useCallback(async (ingredient) => {
        // setIsLoading(true);
        dispatchHttp({ type: 'SEND' });
        // After the POST request success the state will update
        try {
            const jsonResponse = await fetch('https://react-hooks-update-2350b.firebaseio.com/ingredients.json', {
                method: 'POST',
                body: JSON.stringify(ingredient),
                headers: { 'Content-Type': 'application/json' },
            });
            // setIsLoading(false);
            dispatchHttp({ type: 'RESPONSE' });
            const response = jsonResponse.json();
            // setUserIngredients((prevIngredients) => [
            //     //"prevIngredients" its the latest state of all ingredients
            //     ...prevIngredients,
            //     { id: response.name, ...ingredient },
            // ]);
            dispatch({ type: 'ADD', ingredient: { id: response.name, ...ingredient } });
        } catch (error) {
            // setError(error.message);
            // setIsLoading(false);
            dispatchHttp({ type: 'ERROR', errorMessage: error.message });
        }
    }, []);
    const removeIngredientHandler = useCallback(async (ingredientId) => {
        // setIsLoading(true);
        dispatchHttp({ type: 'SEND' });
        try {
            await fetch(`https://react-hooks-update-2350b.firebaseio.com/ingredients/${ingredientId}.json`, {
                method: 'DELETE',
            });
            // setIsLoading(false);
            dispatchHttp({ type: 'RESPONSE' });
            // setUserIngredients((prevIngredients) =>
            //     prevIngredients.filter((ingredient) => ingredientId !== ingredient.id)
            // );
            dispatch({ type: 'DELETE', id: ingredientId });
        } catch (error) {
            // setError(error.message);
            // setIsLoading(false);
            dispatchHttp({ type: 'ERROR', errorMessage: error.message });
        }
    }, []);
    const clearError = useCallback(() => {
        // setError(null);
        dispatchHttp({ type: 'CLEAR' });
    }, []);

    const ingredientList = useMemo(() => {
        return <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler} />;
    }, [userIngredients, removeIngredientHandler]);

    return (
        <div className="App">
            {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}
            <IngredientForm onAddIngredient={addIngredientHandler} loading={httpState.loading} />

            <section>
                <Search onLoadIngredients={filteredIngredientsHandler} />
                {ingredientList}
            </section>
        </div>
    );
};

export default Ingredients;

import React, { useState, useEffect, useRef } from 'react';

import Card from '../UI/Card';
import './Search.css';

const Search = React.memo((props) => {
    const { onLoadIngredients } = props;
    const [enteredFilter, setEnteredFilter] = useState('');
    const inputRef = useRef();

    useEffect(() => {
        const timer = setTimeout(() => {
            //To fetch just when i stop type
            if (enteredFilter === inputRef.current.value) {
                const query = enteredFilter.length === 0 ? '' : `?orderBy="title"&equalTo="${enteredFilter}"`;
                fetch('https://react-hooks-update-2350b.firebaseio.com/ingredients.json' + query) //Just 'fetch' its GET HTTP request
                    .then((response) => response.json()) // Make him not be JSON
                    .then((responseData) => {
                        const loadedIngredients = [];
                        for (const key in responseData) {
                            loadedIngredients.push({
                                id: key,
                                title: responseData[key].title,
                                amount: responseData[key].amount,
                            });
                        }
                        onLoadIngredients(loadedIngredients);
                    });
            }
        }, 500);

        return () => {
            // "return" in useEffect returns cleanup function that execute just before the execute of this useEffect function again
            clearTimeout(timer);
        };
    }, [enteredFilter, onLoadIngredients, inputRef]);

    return (
        <section className="search">
            <Card>
                <div className="search-input">
                    <label>Filter by Title</label>
                    <input
                        ref={inputRef}
                        type="text"
                        value={enteredFilter}
                        onChange={(event) => {
                            setEnteredFilter(event.target.value);
                        }}
                    />
                </div>
            </Card>
        </section>
    );
});

export default Search;

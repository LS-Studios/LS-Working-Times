import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import "./SearchItemContent.scss"
import Transaction from "../../Transaction/Transaction";
import {useSearchParams} from "react-router-dom";

const SearchItemContent = forwardRef(({searchType, canExpand, list, noItemText, expandedTransaction, setExpandedTransaction}, ref) => {
    useImperativeHandle(ref, () => ({

        onClick() {

        }

    }));

    const [filterList, setFilterList] = useState(list)
    const [lastSearch, setLastSearch] = useState("")
    const searchInput = useRef(null);

    const searchChange = (e) => {
        search(e.target.value)
    }

    const searchSubmit = (e) => {
        e.preventDefault()
        searchInput.current.blur()
    }

    const search = (searchValue) => {
        setLastSearch(searchValue)
        const filteredList = [...list].filter(transaction => {
            if (transaction.name.toLowerCase().includes(searchValue.toLowerCase())) {
                return true
            }
            if (transaction.date.toLowerCase().includes(searchValue.toLowerCase())) {
                return true
            }

            return false
        })
        setFilterList(filteredList)
    }

    useEffect(() => {
        if (expandedTransaction != "") {
            const loadedLastSearch = localStorage.getItem(searchType)
            if (loadedLastSearch != null) {
                setLastSearch(loadedLastSearch)
                search(loadedLastSearch)
            }
        } else {
            setLastSearch("")
        }
    }, [])

    useEffect(() => {
        localStorage.setItem(searchType, lastSearch)
    }, [lastSearch])

    return (
        <div className="itemContainer">
            <form className="searchContainer" onSubmit={searchSubmit}>
                <input className="searchInput" value={lastSearch} ref={searchInput} type="text" placeholder="Search for transaction" onChange={searchChange} />
            </form>
            <div className="verticalItemDivider"/>
            <div className="searchItemHolder">
                {
                    filterList.length > 0 ? filterList.map(transaction => {
                        return (
                            <Transaction key={transaction.id} link={null} isExpanded={expandedTransaction == transaction.id} canExpand={canExpand} transaction={transaction} setExpandedTransaction={setExpandedTransaction}/>
                        )
                    }) : <div style={{marginBottom: 8}}>{noItemText}</div>
                }
            </div>
        </div>
    );
})

export default SearchItemContent;
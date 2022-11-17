import Card from "../Card";
import SearchItemContent from "./SearchItemContent";

const SearchItemCard = ({searchType, canExpand, list, noItemText, expandedTransaction, setExpandedTransaction}) => {
    return (
        <Card cardContent={
            <SearchItemContent searchType={searchType} canExpand={canExpand} list={list} noItemText={noItemText} expandedTransaction={expandedTransaction} setExpandedTransaction={setExpandedTransaction} />
        } isPointer={false}/>
    );
};

export default SearchItemCard;
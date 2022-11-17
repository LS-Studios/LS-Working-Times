import Card from "../Card";
import ItemContent from "./ItemContent";

const ItemCard = ({title, canExpand, list, noItemText, link, setExpandedTransaction}) => {
    return (
        <Card cardContent={
            <ItemContent title={title} canExpand={canExpand} list={list} noItemText={noItemText} link={link} setExpandedTransaction={setExpandedTransaction} />
        } isPointer={true}/>
    );
};

export default ItemCard;
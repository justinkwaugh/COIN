import _ from '../../lib/lodash';
import Card from '../../common/card';
import EventCardDefinitions from './eventCards';
import CardTypes from './cardTypes';

class Cards {
    static generateDeck(years) {
        const numCards = years * 15;
        const cardIndexes = _.sampleSize(_.range(0, 72), numCards);
        const deck = _.map(cardIndexes, function (index) {
                return new Card(EventCardDefinitions[index]);
            });
        _.each(_.range(0, years), function (year) {
                const winterIndex = _.random((year * 15) + 10, (year * 15) + 14);
                const winterCard = new Card(
                    {
                        id: 'winter-year-' + (year + 1),
                        type: CardTypes.WINTER,
                        title: 'Winter (Year ' + (year + 1) + ')'
                    });
                deck.splice(winterIndex, (year === (years-1) ? (deck.length - winterIndex) : 0), winterCard);


            });

        return _.reverse(deck);
    }
}

export default Cards;
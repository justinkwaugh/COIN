import Optimates from 'fallingsky/actions/optimates';

class Event20 {
    static handleEvent(state) {
        if(state.arverni.numAlliedTribesAndCitadelsPlaced() < 9) {
            return false;
        }
        Optimates.execute(state, {});
        return true;
    }
}

export default Event20
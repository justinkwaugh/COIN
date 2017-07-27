import LostEagle from 'fallingsky/actions/lostEagle';

class Event33 {
    static handleEvent(state) {
        const fallenLegions = state.romans.fallenLegions();
        if(fallenLegions.length === 0) {
            return false;
        }

        LostEagle.execute(state, {});
    }

}

export default Event33


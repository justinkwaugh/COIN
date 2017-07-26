import FactionIDs from 'fallingsky/config/factionIds';
class Event3 {
    static handleEvent(state) {
        if(state.romans.numLegionsInTrack() <= 4) {
            state.playersByFaction[FactionIDs.ROMANS].takePompeyLosses(state);
            return true;
        }
        return false;
    }
}

export default Event3

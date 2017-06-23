
import FactionIDs from '../../../config/factionIds';

class Event24 {
    static handleEvent(state) {
        const arverniPlayer = state.playersByFaction[FactionIDs.ARVERNI];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        if (!arverniPlayer.isNonPlayer && arverni.hasPlacedCitadel() && arverni.resources() > 0) {
            arverni.removeResources(10);
            return true;
        }
        const belgaePlayer = state.playersByFaction[FactionIDs.BELGAE];
        const belgae = state.factionsById[FactionIDs.ARVERNI];
        if (!belgaePlayer.isNonPlayer && belgae.hasPlacedCitadel() && v.resources() > 0) {
            belgae.removeResources(10);
            return true;
        }

        return false;
    }
}

export default Event24;

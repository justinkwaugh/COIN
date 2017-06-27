
import FactionIDs from '../../../config/factionIds';
import RemoveResources from '../../../actions/removeResources';

class Event24 {
    static handleEvent(state) {
        const arverniPlayer = state.playersByFaction[FactionIDs.ARVERNI];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        if (!arverniPlayer.isNonPlayer && arverni.hasPlacedCitadel() && arverni.resources() > 0) {
            RemoveResources.execute(state, { factionId: FactionIDs.ARVERNI, count: 10});
            return true;
        }
        const belgaePlayer = state.playersByFaction[FactionIDs.BELGAE];
        const belgae = state.factionsById[FactionIDs.ARVERNI];
        if (!belgaePlayer.isNonPlayer && belgae.hasPlacedCitadel() && v.resources() > 0) {
            RemoveResources.execute(state, { factionId: FactionIDs.BELGAE, count: 10});
            return true;
        }

        return false;
    }
}

export default Event24;

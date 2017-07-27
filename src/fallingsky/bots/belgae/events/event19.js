import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import PromoteSuccessor from 'fallingsky/actions/promoteSuccessor';

class Event19 {
    static handleEvent(state) {
        const leader = this.findLeader(state);
        if(!leader || !leader.isSuccessor()) {
            return false;
        }

        PromoteSuccessor.execute(state, { factionId: FactionIDs.ARVERNI });
        state.playersByFaction[FactionIDs.ARVERNI].placeLeader(state, true);
        return true;
    }

    static findLeader(state ) {
        const faction = state.factionsById[FactionIDs.ARVERNI];
        let leader = faction.hasAvailableLeader();
        if(!leader) {
            const leaderRegion = _.find(state.regions, region=> region.getLeaderForFaction(FactionIDs.ARVERNI));
            if(leaderRegion) {
                leader = leaderRegion.getLeaderForFaction(FactionIDs.ARVERNI);
            }
        }
        return leader;
    }
}

export default Event19
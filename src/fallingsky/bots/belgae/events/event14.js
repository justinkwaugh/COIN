import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import MovePieces from 'fallingsky/actions/movePieces';
class Event14 {
    static handleEvent(state) {
        const leaderRegion = _.find(state.regions, region=>region.getLeaderForFaction(FactionIDs.ROMANS));
        if(leaderRegion) {
            const leader = leaderRegion.getLeaderForFaction(FactionIDs.ROMANS);
            MovePieces.execute(state, {
               sourceRegionId: leaderRegion.id,
               destRegionId: RegionIDs.PROVINCIA,
               pieces: [leader]
           });
        }

        state.sequenceOfPlay.ineligibleThroughNext(FactionIDs.ROMANS);
        state.sequenceOfPlay.remainEligible(FactionIDs.BELGAE);

        return true;
    }
}

export default Event14
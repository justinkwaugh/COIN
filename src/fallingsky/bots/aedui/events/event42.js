import _ from '../../../../lib/lodash';
import FactionIDs from '../../../config/factionIds';

class Event42 {
    static handleEvent(state) {
        const aeduiFaction = state.factionsById[FactionIDs.AEDUI];
        const arverniPlayer = state.playersByFaction[FactionIDs.ARVERNI];
        const belgaePlayer = state.playersByFaction[FactionIDs.BELGAE];

        let effective = false;

        if(arverniPlayer.isNonPlayer && belgaePlayer.isNonPlayer) {
            return false;
        }

        const romanControlledRegions = state.getControlledRegionsForFaction(FactionIDs.ROMANS);
        const adjacentRegions = _(romanControlledRegions).map('adjacent').flatten().uniqBy('id').differenceBy(romanControlledRegions, 'id').values();

        const arverniAndBelgaeAlliesUnderRomanControl = _(romanControlledRegions).map('tribes').flatten().filter(function(tribe) {
            return tribe.isAllied() && (tribe.alliedFactionId === FactionIDs.ARVERNI || tribe.alliedFactionId === FactionIDs.BELGAE);
        }).value();

        const arverniAndBelgaeAlliesAdjacentToRomanControl = _(adjacentRegions).map('tribes').flatten().filter(function(tribe) {
            return tribe.isAllied() && (tribe.alliedFactionId === FactionIDs.ARVERNI || tribe.alliedFactionId === FactionIDs.BELGAE);
        }).value();

        throw 'Not yet implemented';
        return effective;
    }
}

export default Event42;

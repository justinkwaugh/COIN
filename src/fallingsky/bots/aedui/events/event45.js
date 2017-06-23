import _ from '../../../../lib/lodash';
import FactionIDs from '../../../config/factionIds';
import RemovePieces from '../../../actions/removePieces';
import PlaceWarbands from '../../../actions/placeWarbands';

class Event45 {
    static handleEvent(state) {
        const aeduiFaction = state.factionsById[FactionIDs.AEDUI];
        const arverniFaction = state.factionsById[FactionIDs.ARVERNI];
        let effective = false;

        const regionsWithArverniWarbands = _(state.regions).map(
            function (region) {
                const arverniWarbands = _(region.piecesByFaction()[FactionIDs.ARVERNI]).filter({type: 'warband'}).sortBy(
                    function (piece) {
                        if (!piece.revealed()) {
                            return 'a';
                        }
                        if (!piece.scouted()) {
                            return 'b'
                        }
                        return 'c';
                    }).value();
                return {
                    region: region,
                    warbands: arverniWarbands,
                    numWarbands: arverniWarbands.length
                }
            }).reject({numWarbands: 0}).groupBy('numWarbands').value();

        const sortedKeys = _(regionsWithArverniWarbands).keys().sort().reverse().value();

        let numRegionsRemaining = 2;
        while (numRegionsRemaining > 0 && sortedKeys.length > 0) {
            const nextGroup = regionsWithArverniWarbands[sortedKeys.shift()];
            const regionEntries = _(nextGroup).sampleSize(Math.min(nextGroup.length, numRegionsRemaining)).value();
            _.each(regionEntries, function (regionEntry) {
                const piecesToRemove = _.take(regionEntry.warbands, 2);
                RemovePieces.perform(state, { faction: arverniFaction, region: regionEntry.region, pieces: piecesToRemove });
                const numWarbandsToPlace = Math.min(aeduiFaction.availableWarbands().length, piecesToRemove.length);
                if(numWarbandsToPlace > 0) {
                    PlaceWarbands.perform(state, { faction: aeduiFaction, region: regionEntry.region, count: numWarbandsToPlace });
                }
                effective = true;
            });
            numRegionsRemaining -= regionEntries.length;
        }

        if (arverniFaction.resources() > 0) {
            const numToTransfer = Math.min(arverniFaction.resources(), 4);
            arverniFaction.removeResources(numToTransfer);
            aeduiFaction.addResources(numToTransfer);
            effective = true;
        }
        return effective;
    }

}

export default Event45;

import _ from 'lib/lodash';
import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'
import FactionIDs from 'fallingsky/config/factionIds'
import RegionIDs from 'fallingsky/config/regionIds'
import FactionActions from 'common/factionActions'
import TribeIDs from 'fallingsky/config/tribeIds'

import MovePieces from 'fallingsky/actions/movePieces'
import PlaceWarbands from 'fallingsky/actions/placeWarbands'
import PlaceAuxilia from 'fallingsky/actions/placeAuxilia'
import PlaceLeader from 'fallingsky/actions/placeLeader'
import PlaceLegions from 'fallingsky/actions/placeLegions'

describe("Move Pieces", function () {
    let state;
    let belgae;
    let arverni;
    let aedui;
    let romans;
    let germanic;

    beforeEach(function () {
        state = new FallingSkyGameState();
        belgae = state.belgae;
        arverni = state.arverni;
        aedui = state.aedui;
        romans = state.romans;
        germanic = state.germanic;
    });

    it('moves warbands from one region to another', function () {
        const mandubii = state.regionsById[RegionIDs.MANDUBII];
        const treveri = state.regionsById[RegionIDs.TREVERI];
        expect(mandubii.getMobilePiecesForFaction(FactionIDs.AEDUI).length).to.equal(0);
        PlaceWarbands.execute(state, {
            factionId: FactionIDs.AEDUI,
            regionId: RegionIDs.MANDUBII,
            count: 6
        });
        const placed = mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI);
        expect(placed.length).to.equal(6);
        placed[1].revealed(true);
        placed[2].revealed(true);
        placed[3].revealed(true);
        placed[4].revealed(true);
        placed[5].revealed(true);
        placed[3].scouted(true);
        placed[4].scouted(true);
        placed[5].scouted(true);
        const placedByType = _.countBy(placed, warband => warband.status());

        expect(placedByType.hidden).to.equal(1);
        expect(placedByType.revealed).to.equal(2);
        expect(placedByType.scouted).to.equal(3);

        MovePieces.execute(state, {
            sourceRegionId: RegionIDs.MANDUBII,
            destRegionId: RegionIDs.TREVERI,
            pieces: placed
        });
        expect(treveri.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI).length).to.equal(6);
        state.actionHistory.undo(state);
        expect(treveri.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI).length).to.equal(0);
        const undone = mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI);
        expect(undone.length).to.equal(6);
        const undoneByType = _.countBy(undone, warband => warband.status());

        expect(undoneByType.hidden).to.equal(1);
        expect(undoneByType.revealed).to.equal(2);
        expect(undoneByType.scouted).to.equal(3);
    });

    it('moves auxilia, legions, and leader from one region to another', function () {
        const mandubii = state.regionsById[RegionIDs.MANDUBII];
        const treveri = state.regionsById[RegionIDs.TREVERI];
        expect(mandubii.getMobilePiecesForFaction(FactionIDs.ROMANS).length).to.equal(0);
        PlaceAuxilia.execute(state, {
            factionId: FactionIDs.ROMANS,
            regionId: RegionIDs.MANDUBII,
            count: 3
        });
        const placed = mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS);
        expect(placed.length).to.equal(3);
        placed[1].revealed(true);
        placed[2].revealed(true);
        const placedByType = _.countBy(placed, auxilia => auxilia.status());

        expect(placedByType.hidden).to.equal(1);
        expect(placedByType.revealed).to.equal(2);

        PlaceLegions.execute(state, {
            factionId: FactionIDs.ROMANS,
            regionId: RegionIDs.MANDUBII,
            count: 2
        });

        expect(mandubii.getLegions().length).to.equal(2);

        PlaceLeader.execute(state, {
            factionId: FactionIDs.ROMANS,
            regionId: RegionIDs.MANDUBII
        });

        expect(mandubii.getLeaderForFaction(FactionIDs.ROMANS)).to.not.be.null;

        const mobile = mandubii.getMobilePiecesForFaction(FactionIDs.ROMANS);
        expect(mobile.length).to.equal(6);
        MovePieces.execute(state, {
            sourceRegionId: RegionIDs.MANDUBII,
            destRegionId: RegionIDs.TREVERI,
            pieces: mobile
        });

        expect(treveri.getMobilePiecesForFaction(FactionIDs.ROMANS).length).to.equal(6);
        expect(mandubii.getMobilePiecesForFaction(FactionIDs.ROMANS).length).to.equal(0);
        state.actionHistory.undo(state);

        expect(treveri.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(0);
        expect(mandubii.getMobilePiecesForFaction(FactionIDs.ROMANS).length).to.equal(6);

        const undoneAuxilia = mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS);
        expect(undoneAuxilia.length).to.equal(3);
        const undoneByType = _.countBy(undoneAuxilia, auxilia => auxilia.status());

        expect(undoneByType.hidden).to.equal(1);
        expect(undoneByType.revealed).to.equal(2);

        expect(mandubii.getLegions().length).to.equal(2);
        expect(mandubii.getLeaderForFaction(FactionIDs.ROMANS)).to.not.be.null;

    });
});
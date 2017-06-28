import _ from 'lib/lodash';
import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'
import FactionIDs from 'fallingsky/config/factionIds'
import RegionIDs from 'fallingsky/config/regionIds'
import FactionActions from 'common/factionActions'
import TribeIDs from 'fallingsky/config/tribeIds'

import RemovePieces from 'fallingsky/actions/removePieces'
import PlaceWarbands from 'fallingsky/actions/placeWarbands'
import PlaceAuxilia from 'fallingsky/actions/placeAuxilia'
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe'
import PlaceCitadel from 'fallingsky/actions/placeCitadel'
import PlaceFort from 'fallingsky/actions/placeFort'
import PlaceLeader from 'fallingsky/actions/placeLeader'
import PlaceLegions from 'fallingsky/actions/placeLegions'

describe("Remove Pieces", function () {
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

    it('removes warbands from region', function () {
        const aedui = state.regionsById[RegionIDs.AEDUI];
        expect(aedui.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI).length).to.equal(0);
        PlaceWarbands.execute(state, {
            factionId: FactionIDs.AEDUI,
            regionId: RegionIDs.AEDUI,
            count: 6
        });
        const placed = aedui.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI);
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

        RemovePieces.execute(state, {
            factionId: FactionIDs.AEDUI,
            regionId: RegionIDs.AEDUI,
            pieces: placed
        });
        expect(aedui.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI).length).to.equal(0);
        state.actionHistory.undo(state);
        const undone = aedui.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI);
        expect(undone.length).to.equal(6);
        const undoneByType = _.countBy(undone, warband => warband.status());

        expect(undoneByType.hidden).to.equal(1);
        expect(undoneByType.revealed).to.equal(2);
        expect(undoneByType.scouted).to.equal(3);
    });

    it('removes auxilia from region', function () {
        const aedui = state.regionsById[RegionIDs.AEDUI];
        expect(aedui.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(0);
        PlaceAuxilia.execute(state, {
            factionId: FactionIDs.ROMANS,
            regionId: RegionIDs.AEDUI,
            count: 3
        });
        const placed = aedui.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS);
        expect(placed.length).to.equal(3);
        placed[1].revealed(true);
        placed[2].revealed(true);

        const placedByType = _.countBy(placed, auxilia => auxilia.status());

        expect(placedByType.hidden).to.equal(1);
        expect(placedByType.revealed).to.equal(2);

        RemovePieces.execute(state, {
            factionId: FactionIDs.ROMANS,
            regionId: RegionIDs.AEDUI,
            pieces: placed
        });
        expect(aedui.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(0);
        state.actionHistory.undo(state);
        const undone = aedui.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS);
        expect(undone.length).to.equal(3);
        const undoneByType = _.countBy(undone, auxilia => auxilia.status());

        expect(undoneByType.hidden).to.equal(1);
        expect(undoneByType.revealed).to.equal(2);
    });

    it('removes allies from region', function () {
        const mandubii = state.regionsById[RegionIDs.MANDUBII];

        PlaceAlliedTribe.execute(state, {
            factionId: FactionIDs.AEDUI,
            regionId: RegionIDs.MANDUBII,
            tribeId: TribeIDs.MANDUBII
        });

        PlaceAlliedTribe.execute(state, {
            factionId: FactionIDs.AEDUI,
            regionId: RegionIDs.MANDUBII,
            tribeId: TribeIDs.LINGONES
        });

        const allies = mandubii.getAlliesForFaction(FactionIDs.AEDUI);
        expect(allies.length).to.equal(2);
        expect(_.find(allies, {tribeId : TribeIDs.MANDUBII})).to.not.equal(-1);
        expect(_.find(allies, {tribeId : TribeIDs.LINGONES})).to.not.equal(-1);

        RemovePieces.execute(state, {
            factionId: FactionIDs.AEDUI,
            regionId: RegionIDs.MANDUBII,
            pieces: allies
        });

        expect(mandubii.getAlliesForFaction(FactionIDs.AEDUI).length).to.equal(0);
        state.actionHistory.undo(state);

        const undoneAllies = mandubii.getAlliesForFaction(FactionIDs.AEDUI);
        expect(undoneAllies.length).to.equal(2);
        expect(_.find(undoneAllies, {tribeId : TribeIDs.MANDUBII})).to.not.equal(-1);
        expect(_.find(undoneAllies, {tribeId : TribeIDs.LINGONES})).to.not.equal(-1);
    });

    it('removes citadel from region', function () {
        const mandubii = state.regionsById[RegionIDs.MANDUBII];

        PlaceCitadel.execute(state, {
            factionId: FactionIDs.AEDUI,
            regionId: RegionIDs.MANDUBII,
            tribeId: TribeIDs.MANDUBII
        });

        const citadel = mandubii.getCitadelForFaction(FactionIDs.AEDUI);
        expect(citadel).to.not.be.null;
        expect(citadel.tribeId).to.equal(TribeIDs.MANDUBII);

        RemovePieces.execute(state, {
            factionId: FactionIDs.AEDUI,
            regionId: RegionIDs.MANDUBII,
            pieces: [citadel]
        });

        expect(mandubii.getCitadelForFaction(FactionIDs.AEDUI)).to.be.null;

        state.actionHistory.undo(state);

        const undoneCitadel = mandubii.getCitadelForFaction(FactionIDs.AEDUI);
        expect(undoneCitadel).to.not.be.null;
        expect(undoneCitadel.tribeId).to.equal(TribeIDs.MANDUBII);
    });

    it('removes fort from region', function () {
        const mandubii = state.regionsById[RegionIDs.MANDUBII];

        PlaceFort.execute(state, {
            factionId: FactionIDs.ROMANS,
            regionId: RegionIDs.MANDUBII
        });

        const fort = mandubii.getFort();
        expect(fort).to.not.be.null;

        RemovePieces.execute(state, {
            factionId: FactionIDs.ROMANS,
            regionId: RegionIDs.MANDUBII,
            pieces: [fort]
        });

        expect(mandubii.getFort(FactionIDs.AEDUI)).to.be.null;

        state.actionHistory.undo(state);

        const undoneFort = mandubii.getFort();
        expect(undoneFort).to.not.be.null;
    });

    it('removes leader from region', function () {
        const mandubii = state.regionsById[RegionIDs.MANDUBII];

        PlaceLeader.execute(state, {
            factionId: FactionIDs.ROMANS,
            regionId: RegionIDs.MANDUBII
        });

        const leader = mandubii.getLeaderForFaction(FactionIDs.ROMANS);
        expect(leader).to.not.be.null;

        RemovePieces.execute(state, {
            factionId: FactionIDs.ROMANS,
            regionId: RegionIDs.MANDUBII,
            pieces: [leader]
        });

        expect(mandubii.getLeaderForFaction(FactionIDs.AEDUI)).to.be.null;

        state.actionHistory.undo(state);

        const undoneLeader = mandubii.getLeaderForFaction(FactionIDs.ROMANS);
        expect(undoneLeader).to.not.be.null;

    });

    it('removes legions from region', function () {
        const mandubii = state.regionsById[RegionIDs.MANDUBII];

        PlaceLegions.execute(state, {
            factionId: FactionIDs.ROMANS,
            regionId: RegionIDs.MANDUBII,
            count: 2
        });

        const legions = mandubii.getLegions();
        expect(legions.length).to.equal(2);

        RemovePieces.execute(state, {
            factionId: FactionIDs.ROMANS,
            regionId: RegionIDs.MANDUBII,
            pieces: legions
        });

        expect(mandubii.getLegions().length).to.equal(0);

        state.actionHistory.undo(state);

        const undoneLegions = mandubii.getLegions();
        expect(undoneLegions.length).to.equal(2);

    });

});
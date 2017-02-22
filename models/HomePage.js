/**
 * @Stake Website
 * 
 * Homepage Model
 * @module Homepage
 * @class Homepage
 * @author Matt Benson
 * 
 * For field docs: http://keystonejs.com/docs/database/
 *
 * ==========
 */

// require('./users.js');

var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Homepage model
 * @constructor
 * See: http://keystonejs.com/docs/database/#lists-options
 */
 var Homepage = new keystone.List('Homepage', 
	{
		label: 'Home Page',
		singular: 'Home Page',
		track: true,
		sortable: true
	});

 Homepage.add({
 	
 	name: { 
 		type: String, 
 		default: "Home Page (Name in Keystone)", 
 		required: true, 
 		initial: true 
 	},

	title: { 
		type: Types.Markdown, 
		label: "Homepage Title",  
		initial: true, 
		required: true 
	},

	tagline: {
		type: Types.Markdown, 
		label: "Tagline", 
		initial: true, 
		required: true
	},

	summary: {
		type: Types.Markdown, 
		label: "Summary", 
		initial: true, 
		required: true
	},

	createdAt: { 
		type: Date, 
		default: Date.now, 
		noedit: true, 
		hidden: true 
	}
},


'Pitch', {
	ctaParagraphOne: {
		type: Types.Markdown,
		label: "Pitch Paragraph One",
		initial: false,
		required: false
	},
	
	ctaParagraphTwo: {
		type: Types.Markdown,
		label: "Pitch Paragraph Two",
		initial: false,
		required: false
	},
	
	pointOneText: {
		type: Types.Markdown,
		label: "Point One Text"		
	},

	pointTwoText: {
		type: Types.Markdown,
		label: "Point Two Text"		
	},
	
	pointThreeText: {
		type: Types.Markdown,
		label: "Point Three Text"
	},
	
	showcaseImage: {
		type: Types.CloudinaryImage,
		folder: 'at-stake-site/images/layout/home/landing',
		label: 'Features Image'
	}
 },

'Game Features', {
	featureOneTitle: {
		type: Types.Markdown,
		label: "Game Feature Title One",
		initial: false,
		required: false
	},

	featureOneParagraph: {
		type: Types.Markdown,
		label: "Game Feature Paragraph One",
		initial: false,
		required: false
	},
	
	featureOneIcon: {
		type: Types.CloudinaryImage,
		folder: 'at-stake-site/images/layout/home/landing',
		label: 'Feature One Image'
	},

	featureTwoTitle: {
		type: Types.Markdown,
		label: "Game Feature Title Two",
		initial: false,
		required: false
	},

	featureTwoParagraph: {
		type: Types.Markdown,
		label: "Game Feature Paragraph Two",
		initial: false,
		required: false
	},
	
	featureTwoIcon: {
		type: Types.CloudinaryImage,
		folder: 'at-stake-site/images/layout/home/landing',
		label: 'Feature Two Image'
	},

	featureThreeTitle: {
		type: Types.Markdown,
		label: "Game Feature Title Three",
		initial: false,
		required: false
	},

	featureThreeParagraph: {
		type: Types.Markdown,
		label: "Game Feature Paragraph Three",
		initial: false,
		required: false
	},
	
	featureThreeIcon: {
		type: Types.CloudinaryImage,
		folder: 'at-stake-site/images/layout/home/landing',
		label: 'Feature One Image'
	}
 },

// // Flowchart Version
// 'Game Overview Flowchart', {
// 	overviewHeader: {
// 		type: Types.Markdown,
// 		label: "Header for Game Overview"
// 	},
// 	brainstormHeader: {
// 		type: Types.Markdown,
// 		label: "Brainstorm Header"
// 	},
// 	brainstormParagraph: {
// 		type: Types.Markdown,
// 		label: "Brainstorm Paragraph"
// 	},
// 	pitchHeader: {
// 		type: Types.Markdown,
// 		label: "Pitch Header"
// 	},
// 	pitchParagraph: {
// 		type: Types.Markdown,
// 		label: "Pitch Paragraph"
// 	},
// 	deliberateHeader: {
// 		type: Types.Markdown,
// 		label: "Deliberate Header"
// 	},
// 	deliberateParagraph: {
// 		type: Types.Markdown,
// 		label: "Deliberate Paragraph"
// 	}	
// }

// Paragraph Version
'Flow of Game Paragraph', {
	flowOfGameHeader: {
		type: Types.Markdown,
		label: "Header for Game Overview"
	},

	flowOfGamePicture: {
		type: Types.CloudinaryImage,
    label: 'Gameplay Image',
    folder: 'at-stake-site/images/layout/home/landing'
	},

	flowOfGameParagraph: {
		type: Types.Markdown,
		label: "Paragraph for Game Overview"
	}
},

'Learn More', {
	learnMoreHeader: {
		type: Types.Markdown,
		label: "Learn More Header"
	},

	learnMorePicture: {
		type: Types.CloudinaryImage,
    label: 'Learn More Image',
    folder: 'at-stake-site/images/layout/home/landing'
	},

	learnMoreParagraph: {
		type: Types.Markdown,
		label: "Learn More Paragraph"
	}
},

'Design and Development Team', {
	principalInvestigator : { 
		type: Types.Relationship, 
		ref: 'TeamMembers',
		label: "Principal Investigator"
	},
	productManager : { 
		type: Types.Relationship, 
		ref: 'TeamMembers',
		label: "Product Manager"
	},
	projectManager : { 
		type: Types.Relationship, 
		ref: 'TeamMembers',
		label: "Project Manager"
	},
	leadDeveloper : { 
		type: Types.Relationship, 
		ref: 'TeamMembers',
		label: "Lead Developer"
	},
	artDirector : { 
		type: Types.Relationship, 
		ref: 'TeamMembers',
		label: "Art Director"
	},
	gameDesigner : { 
		type: Types.Relationship, 
		ref: 'TeamMembers',
		label: "Game Designer"
	},
	otherGameDesigner : { 
		type: Types.Relationship, 
		ref: 'TeamMembers',
		label: "Game Designer"
	},
	juniorDeveloper : { 
		type: Types.Relationship, 
		ref: 'TeamMembers',
		label: "Junior Developer"
	},
	productionAssistant : { 
		type: Types.Relationship, 
		ref: 'TeamMembers',
		label: "Production Assistant"
	},
	otherProductionAssistant : { 
		type: Types.Relationship, 
		ref: 'TeamMembers',
		label: "Production Assistant"
	}
});

// Homepage.defaultSort = '-createdAt';
Homepage.defaultColumns = 'name, updatedAt';
Homepage.register();
exports = module.exports = Homepage;
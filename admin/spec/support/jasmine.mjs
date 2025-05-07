export default {
  // Spec directory path relative to the current working dir when jasmine is executed
  spec_dir: "spec",

  // Array of filepaths (and globs) relative to spec_dir to include and exclude
  spec_files: [
    "**/*[sS]pec.?(m)js",
    "!**/*nospec.js"  // Exclude files with 'nospec' in their name
  ],

  // Array of filepaths (and globs) relative to spec_dir to include before jasmine specs
  helpers: [
    "helpers/**/*.?(m)js"
  ],
  
  // Configuration of the Jasmine environment
  env: {
    // Whether to fail a spec that ran no expectations
    failSpecWithNoExpectations: false,
    
    // Stop execution of a spec after the first expectation failure in it
    stopSpecOnExpectationFailure: false,

    // Stop execution of the suite after the first spec failure  
    stopOnSpecFailure: false,

    // Run specs in order
    random: false,
    
    // Prevent duplicate spec names
    forbidDuplicateNames: true
  }
}
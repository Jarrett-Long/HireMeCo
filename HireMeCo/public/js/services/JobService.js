// For creating new jobs

angular.module('JobServiceApp', []).factory('JobService', function ($q, $timeout, $http){
    
    //TODO: everything
    
    // instantiate local variables
    var SkillList = [];
    var SurveyList = [];
    var Company = " ";
    var JobTitle = "";
    
    // return available functions for use in controllers
    return ({
        postJob: postJob,
        getSkillList: getSkillList,
        getSurveyList: getSurveyList,
        getCompany: getCompany,
        getJobTitle: getJobTitle
    });
    
    function getSkillList(){
        return skills;
    }
    
    function getSurveyList() {
        return attitudes;
    }
    
    function getCompany(){
        return Company;
    }
    
    function getJobTitle(){
        return JobTitle;
    }
    
    
    function postJob(JobTitle, Company, Description, SkillList, SurveyList){
        
        var deferred = $q.defer();
        console.log("Entered the job service");
        console.log("This is whats getting sent: ");
        console.log("JobTitle: " + JobTitle);
        console.log("Company: " + Company);
        console.log("SkillList: " + SkillList);
        console.log("SurveyList: " + SurveyList);

        $http.post('/api/job', {
            JobTitle: JobTitle,
            Company: Company,
            Description: Description,
            SkillList: SkillList,
            SurveyList: SurveyList
            
          })
            .success(function (data, status) {
                console.log("Successful service post to api/job");
              if(status === 200 && data.status){
                  deferred.resolve();
              } else {
                  deferred.reject();
              }
          })
            .error(function (data) {
                console.log("Unsuccessful service post to api/job");
              deferred.reject();
          });
          
          return deferred.promise;
        
    };
    
    
});
package org.restcomm.connect.rvd.storage;

import org.restcomm.connect.rvd.model.CallControlInfo;
import org.restcomm.connect.rvd.model.ProjectParameters;
import org.restcomm.connect.rvd.model.ProjectSettings;
import org.restcomm.connect.rvd.model.client.WavItem;
import org.restcomm.connect.rvd.model.project.Node;
import org.restcomm.connect.rvd.model.project.ProjectState;
import org.restcomm.connect.rvd.model.server.ProjectIndex;
import org.restcomm.connect.rvd.storage.exceptions.StorageException;

import java.util.List;

/**
 * Data operations for a project. While constructing this dao, the referenced project is set.
 *
 * @author otsakir@gmail.com - Orestis Tsakiridis
 */
public interface ProjectDao {

    /**
     * Loads and parses the project state data. Returns the parsed ProjectState object or null if the project is not found.
     *
     * @return ProjectState object or null
     * @throws StorageException
     * @param applicationId
     */
    ProjectState loadProject(String applicationId) throws StorageException;

    /**
     * Returns project index information (the 'data/project' file in FS implementation).
     *
     * Use this method to check if a built project exists. If it returns null it doesn't.
     *
     * @param applicationId
     * @return a ProjectIndex object or null
     * @throws StorageException
     */
    ProjectIndex loadProjectOptions(String applicationId) throws StorageException;

    Node loadNode(String moduleName, String applicationId) throws StorageException;

    /**
     * Returns current project's bootstrap information as a JSON string. If it does not exist it returns null.
     *
     * @return a JSON block as a string of null
     * @throws StorageException
     * @param applicationId
     */
    String loadBootstrapInfo(String applicationId) throws StorageException;

    /**
     * Loads and returns project 'settings' asset or null if this is not found.
     *
     * @return a ProjectSettings object or null
     *
     * @throws StorageException on serious storage errors
     * @param applicationId
     */
    ProjectSettings loadSettings(String applicationId) throws StorageException;

    CallControlInfo loadWebTriggerInfo(String applicationId) throws StorageException;

    void storeWebTriggerInfo(CallControlInfo webTriggerInfo, String applicationId) throws StorageException;

    void removeWebTriggerInfo(String applicationId);

    void storeSettings(ProjectSettings projectSettings, String applicationId) throws StorageException;

    String loadProjectStateRaw(String applicationId) throws StorageException;

    void createProject(String applicationId, ProjectState projectState) throws StorageException;

    void createProjectFromLocation(String applicationId, String sourcePath, String owner) throws StorageException;

    void createProjectFromTemplate(String applicationId, String templateId, String projectAlias, ProjectTemplateDao templateDao, String owner) throws StorageException;

    List<WavItem> listMedia(String applicationId) throws StorageException;

    ProjectParameters loadProjectParameters(String applicationId) throws StorageException;

    void storeProjectParameters(String applicationId, ProjectParameters parameters) throws StorageException;
}

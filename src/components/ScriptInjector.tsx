import { useEffect } from 'react';
import { useStore } from '../context/StoreContext';

export default function ScriptInjector() {
  const { settings } = useStore();

  useEffect(() => {
    if (!settings || !settings.trackingScripts) return;

    // Inject each script from the trackingScripts array
    settings.trackingScripts.forEach((script) => {
      // Check if this script was already injected to avoid duplicates
      const scriptId = `dm-script-${script.id}`;
      if (document.getElementById(scriptId)) return;

      try {
        const div = document.createElement('div');
        div.id = scriptId;
        div.style.display = 'none';
        div.innerHTML = script.code;

        // Extract and execute scripts from the pasted code
        const children = Array.from(div.children);
        
        children.forEach(child => {
          if (child.tagName === 'SCRIPT') {
            const newScript = document.createElement('script');
            newScript.id = `${scriptId}-element`;
            
            // Copy contents
            if ((child as HTMLScriptElement).src) {
              newScript.src = (child as HTMLScriptElement).src;
              newScript.async = true;
            } else {
              newScript.innerHTML = child.innerHTML;
            }

            // Copy attributes
            Array.from(child.attributes).forEach(attr => {
              if (attr.name !== 'src') {
                newScript.setAttribute(attr.name, attr.value);
              }
            });

            document.head.appendChild(newScript);
          } else {
            // For other tags (like noscript or style), clone and append to body or head
            if (child.tagName === 'STYLE') {
              document.head.appendChild(child.cloneNode(true));
            } else {
              document.body.appendChild(child.cloneNode(true));
            }
          }
        });
      } catch (err) {
        console.error(`Error injecting DM script "${script.name}":`, err);
      }
    });
  }, [settings]);

  return null;
}
